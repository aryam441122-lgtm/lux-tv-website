
import React, { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { PinInput } from '@/components/ui/pin-input';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Profile {
  id: string;
  user_id: string;
  name: string;
  avatar_url?: string;
  is_adult: boolean;
  pin_code?: string;
  created_at: string;
  updated_at: string;
}

interface ProfilePinDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: Profile | null;
  mode: 'set' | 'change' | 'remove' | 'verify';
  onSuccess: () => void;
  onVerified?: () => void;
}

export const ProfilePinDialog: React.FC<ProfilePinDialogProps> = ({
  open,
  onOpenChange,
  profile,
  mode,
  onSuccess,
  onVerified
}) => {
  const { t } = useLanguage();
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const resetState = () => {
    setCurrentPin('');
    setNewPin('');
    setConfirmPin('');
    setStep(1);
  };

  const handleClose = () => {
    resetState();
    onOpenChange(false);
  };

  const hashPin = async (pin: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(pin);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hash))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  };

  const verifyPin = async (inputPin: string, storedHash: string): Promise<boolean> => {
    const inputHash = await hashPin(inputPin);
    return inputHash === storedHash;
  };

  const handleSetPin = async () => {
    if (!profile) return;
    
    if (step === 1) {
      setStep(2);
      return;
    }

    if (newPin !== confirmPin) {
      toast({
        title: t('error'),
        description: t('error.passwords_not_match'),
        variant: "destructive"
      });
      setConfirmPin('');
      return;
    }

    setIsLoading(true);
    try {
      const hashedPin = await hashPin(newPin);
      
      const { error } = await supabase
        .from('profiles')
        .update({ pin_code: hashedPin } as any)
        .eq('id', profile.id);

      if (error) throw error;

      toast({
        title: t('success.account_created'),
        description: t('profile.pin_set_success')
      });
      
      handleClose();
      onSuccess();
    } catch (error) {
      console.error('Error setting PIN:', error);
      toast({
        title: t('error'),
        description: t('profile.pin_set_error'),
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePin = async () => {
    if (!profile?.pin_code) return;
    
    if (step === 1) {
      // Verify current PIN
      const isValid = await verifyPin(currentPin, profile.pin_code);
      if (!isValid) {
        toast({
          title: t('error'),
          description: t('profile.pin_incorrect'),
          variant: "destructive"
        });
        setCurrentPin('');
        return;
      }
      setStep(2);
      return;
    }

    if (step === 2) {
      // Check if new PIN is the same as current PIN
      const isSameAsCurrent = await verifyPin(newPin, profile.pin_code);
      if (isSameAsCurrent) {
        toast({
          title: t('error'),
          description: t('profile.pin_same_as_current'),
          variant: "destructive"
        });
        setNewPin('');
        return;
      }
      setStep(3);
      return;
    }

    if (newPin !== confirmPin) {
      toast({
        title: t('error'),
        description: t('error.passwords_not_match'),
        variant: "destructive"
      });
      setConfirmPin('');
      return;
    }

    setIsLoading(true);
    try {
      const hashedPin = await hashPin(newPin);
      
      const { error } = await supabase
        .from('profiles')
        .update({ pin_code: hashedPin } as any)
        .eq('id', profile.id);

      if (error) throw error;

      toast({
        title: t('success.account_created'),
        description: t('profile.pin_changed_success')
      });
      
      handleClose();
      onSuccess();
    } catch (error) {
      console.error('Error changing PIN:', error);
      toast({
        title: t('error'),
        description: t('profile.pin_change_error'),
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemovePin = async () => {
    if (!profile?.pin_code) return;
    
    const isValid = await verifyPin(currentPin, profile.pin_code);
    if (!isValid) {
      toast({
        title: t('error'),
        description: t('profile.pin_incorrect'),
        variant: "destructive"
      });
      setCurrentPin('');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ pin_code: null } as any)
        .eq('id', profile.id);

      if (error) throw error;

      toast({
        title: t('success.account_created'),
        description: t('profile.pin_removed_success')
      });
      
      handleClose();
      onSuccess();
    } catch (error) {
      console.error('Error removing PIN:', error);
      toast({
        title: t('error'),
        description: t('profile.pin_remove_error'),
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyPin = async () => {
    if (!profile?.pin_code) return;
    
    const isValid = await verifyPin(currentPin, profile.pin_code);
    if (!isValid) {
      toast({
        title: t('error'),
        description: t('profile.pin_incorrect'),
        variant: "destructive"
      });
      setCurrentPin('');
      return;
    }

    handleClose();
    onVerified?.();
  };

  const getTitle = () => {
    switch (mode) {
      case 'set':
        return step === 1 ? t('profile.set_pin') : t('profile.confirm_pin');
      case 'change':
        if (step === 1) return t('profile.enter_current_pin');
        if (step === 2) return t('profile.enter_new_pin');
        return t('profile.confirm_new_pin');
      case 'remove':
        return t('profile.enter_current_pin');
      case 'verify':
        return t('profile.enter_pin');
      default:
        return '';
    }
  };

  const getCurrentPin = () => {
    switch (mode) {
      case 'set':
        return step === 1 ? newPin : confirmPin;
      case 'change':
        if (step === 1) return currentPin;
        if (step === 2) return newPin;
        return confirmPin;
      case 'remove':
      case 'verify':
        return currentPin;
      default:
        return '';
    }
  };

  const handlePinChange = (pin: string) => {
    switch (mode) {
      case 'set':
        if (step === 1) setNewPin(pin);
        else setConfirmPin(pin);
        break;
      case 'change':
        if (step === 1) setCurrentPin(pin);
        else if (step === 2) setNewPin(pin);
        else setConfirmPin(pin);
        break;
      case 'remove':
      case 'verify':
        setCurrentPin(pin);
        break;
    }
  };

  const handleConfirm = () => {
    switch (mode) {
      case 'set':
        handleSetPin();
        break;
      case 'change':
        handleChangePin();
        break;
      case 'remove':
        handleRemovePin();
        break;
      case 'verify':
        handleVerifyPin();
        break;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 bg-transparent border-none shadow-none max-w-sm">
        <PinInput
          pin={getCurrentPin()}
          onPinChange={handlePinChange}
          onConfirm={handleConfirm}
          onCancel={handleClose}
          title={getTitle()}
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  );
};
