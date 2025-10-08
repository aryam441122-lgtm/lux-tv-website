import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import { User, Plus, Edit2, Upload, Save, X, Trash2, Lock, Unlock, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { ProfilePinDialog } from './ProfilePinDialog';

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

const ProfileSelector = () => {
  const { profiles, selectedProfile, setSelectedProfile, refreshProfiles, user, signOut } = useAuth();
  const { t } = useLanguage();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);
  const [newProfileName, setNewProfileName] = useState('');
  const [newProfileIsAdult, setNewProfileIsAdult] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  
  // PIN related states
  const [pinDialogOpen, setPinDialogOpen] = useState(false);
  const [pinDialogMode, setPinDialogMode] = useState<'set' | 'change' | 'remove' | 'verify'>('set');
  const [selectedProfileForPin, setSelectedProfileForPin] = useState<Profile | null>(null);

  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: t('nav.login'),
        description: t('profile.updated_success')
      });
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: t('error'),
        description: t('error'),
        variant: "destructive"
      });
    }
  };

  const handleCreateProfile = async () => {
    if (!newProfileName.trim() || !user) return;

    // Check if profiles limit is reached (5 profiles max)
    if (profiles.length >= 5) {
      toast({
        title: t('error'),
        description: t('profile.max_limit_reached'),
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      let avatarUrl = '';

      // Upload avatar if selected
      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, selectedFile);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('avatars')
          .getPublicUrl(fileName);
        
        avatarUrl = urlData.publicUrl;
      }

      const { error } = await supabase
        .from('profiles')
        .insert({
          user_id: user.id,
          name: newProfileName.trim(),
          is_adult: newProfileIsAdult,
          avatar_url: avatarUrl || null
        });

      if (error) throw error;

      await refreshProfiles();
      setShowCreateDialog(false);
      setNewProfileName('');
      setNewProfileIsAdult(false);
      setSelectedFile(null);
      setPreviewUrl('');
      
      toast({
        title: t('profile.created_success'),
        description: t('profile.created_success')
      });
    } catch (error) {
      console.error('Error creating profile:', error);
      toast({
        title: t('error'),
        description: t('profile.create_error'),
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!editingProfile || !editingProfile.name.trim()) return;

    setIsLoading(true);
    try {
      let avatarUrl = editingProfile.avatar_url;

      // Upload new avatar if selected
      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `${user?.id}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, selectedFile);

        if (uploadError) throw uploadError;

        // Delete old avatar if exists
        if (editingProfile.avatar_url) {
          const oldFileName = editingProfile.avatar_url.split('/').pop();
          if (oldFileName) {
            await supabase.storage
              .from('avatars')
              .remove([`${user?.id}/${oldFileName}`]);
          }
        }

        const { data: urlData } = supabase.storage
          .from('avatars')
          .getPublicUrl(fileName);
        
        avatarUrl = urlData.publicUrl;
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          name: editingProfile.name.trim(),
          is_adult: editingProfile.is_adult,
          avatar_url: avatarUrl
        })
        .eq('id', editingProfile.id);

      if (error) throw error;

      await refreshProfiles();
      setEditingProfile(null);
      setSelectedFile(null);
      setPreviewUrl('');
      
      toast({
        title: t('profile.updated_success'),
        description: t('profile.updated_success')
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: t('error'),
        description: t('profile.update_error'),
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProfile = async (profileId: string) => {
    if (profiles.length <= 1) {
      toast({
        title: t('profile.cannot_delete'),
        description: t('profile.cannot_delete_desc'),
        variant: "destructive"
      });
      return;
    }

    try {
      const profileToDelete = profiles.find(p => p.id === profileId);
      
      // Delete avatar if exists
      if (profileToDelete?.avatar_url) {
        const fileName = profileToDelete.avatar_url.split('/').pop();
        if (fileName) {
          await supabase.storage
            .from('avatars')
            .remove([`${user?.id}/${fileName}`]);
        }
      }

      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', profileId);

      if (error) throw error;

      // If deleted profile was selected, select another one
      if (selectedProfile?.id === profileId) {
        const remainingProfiles = profiles.filter(p => p.id !== profileId);
        if (remainingProfiles.length > 0) {
          setSelectedProfile(remainingProfiles[0]);
        }
      }

      await refreshProfiles();
      
      toast({
        title: t('profile.deleted_success'),
        description: t('profile.deleted_success')
      });
    } catch (error) {
      console.error('Error deleting profile:', error);
      toast({
        title: t('error'),
        description: t('profile.delete_error'),
        variant: "destructive"
      });
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: t('profile.file_too_large'),
          description: t('profile.file_too_large_desc'),
          variant: "destructive"
        });
        return;
      }

      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetFileSelection = () => {
    setSelectedFile(null);
    setPreviewUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleProfileSelect = (profile: Profile) => {
    if (profile.pin_code) {
      // Profile has PIN protection - show PIN verification dialog
      setSelectedProfileForPin(profile);
      setPinDialogMode('verify');
      setPinDialogOpen(true);
    } else {
      // No PIN protection - select directly
      setSelectedProfile(profile);
    }
  };

  const handlePinVerified = () => {
    if (selectedProfileForPin) {
      setSelectedProfile(selectedProfileForPin);
      setSelectedProfileForPin(null);
    }
  };

  const handleSetPin = (profile: Profile) => {
    setSelectedProfileForPin(profile);
    setPinDialogMode('set');
    setPinDialogOpen(true);
  };

  const handleChangePin = (profile: Profile) => {
    setSelectedProfileForPin(profile);
    setPinDialogMode('change');
    setPinDialogOpen(true);
  };

  const handleRemovePin = (profile: Profile) => {
    setSelectedProfileForPin(profile);
    setPinDialogMode('remove');
    setPinDialogOpen(true);
  };

  const handlePinSuccess = () => {
    refreshProfiles();
    setSelectedProfileForPin(null);
  };

  if (profiles.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-900 flex items-center justify-center p-4">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p>{t('loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-900 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Header with Logout Button */}
        <div className="flex justify-between items-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-red-500 to-red-400 bg-clip-text text-transparent">
            {t('profile.who_watching')}
          </h1>
          
          <Button
            onClick={handleLogout}
            variant="outline"
            className="border-red-500 text-red-400 hover:bg-red-500 hover:text-white transition-all duration-300 hover:scale-105"
          >
            <LogOut className="w-4 h-4 mr-2" />
            {t('nav.logout')}
          </Button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {profiles.map((profile) => (
            <Card 
              key={profile.id} 
              className={`bg-black/40 backdrop-blur-sm border-2 transition-all duration-300 cursor-pointer hover:scale-105 ${
                selectedProfile?.id === profile.id 
                  ? 'border-red-500 bg-red-500/10' 
                  : 'border-gray-700 hover:border-red-400'
              }`}
              onClick={() => handleProfileSelect(profile)}
            >
              <CardContent className="p-4 sm:p-6 text-center">
                <div className="relative mb-3 sm:mb-4">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 mx-auto rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center overflow-hidden">
                    {profile.avatar_url ? (
                      <img 
                        src={profile.avatar_url} 
                        alt={profile.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-white" />
                    )}
                  </div>
                  
                  {/* PIN Protection Indicator */}
                  {profile.pin_code && (
                    <div className="absolute -top-1 -right-1 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-yellow-600 flex items-center justify-center">
                      <Lock className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                    </div>
                  )}
                  
                  {/* Edit Button - Top Left */}
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingProfile(profile);
                      setPreviewUrl(profile.avatar_url || '');
                    }}
                    variant="ghost"
                    size="sm"
                    className="absolute -top-2 -left-2 w-8 h-8 rounded-full bg-blue-600/90 hover:bg-blue-700 p-0 transition-all duration-300 hover:scale-110"
                  >
                    <Edit2 className="w-4 h-4 text-white" />
                  </Button>

                  {/* Delete Button - Top Right (Only if more than 1 profile) */}
                  {profiles.length > 1 && (
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteProfile(profile.id);
                      }}
                      variant="ghost"
                      size="sm"
                      className="absolute -top-2 -right-8 w-8 h-8 rounded-full bg-red-600/90 hover:bg-red-700 p-0 transition-all duration-300 hover:scale-110"
                    >
                      <Trash2 className="w-4 h-4 text-white" />
                    </Button>
                  )}
                </div>
                
                <h3 className="text-white font-semibold text-sm sm:text-base lg:text-lg mb-1 truncate">
                  {profile.name}
                </h3>
                
                <div className="flex items-center justify-center gap-2 flex-wrap">
                  {profile.is_adult && (
                    <span className="text-xs text-red-400 bg-red-500/20 px-2 py-1 rounded-full">
                      {t('profile.adult')}
                    </span>
                  )}
                  {profile.pin_code && (
                    <span className="text-xs text-yellow-400 bg-yellow-500/20 px-2 py-1 rounded-full">
                      {t('profile.pin_protected')}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Add Profile Card - Only show if less than 5 profiles */}
          {profiles.length < 5 && (
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Card className="bg-black/20 backdrop-blur-sm border-2 border-dashed border-gray-600 hover:border-red-400 transition-all duration-300 cursor-pointer hover:scale-105">
                  <CardContent className="p-4 sm:p-6 text-center">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 mx-auto rounded-full bg-gray-700/50 flex items-center justify-center mb-3 sm:mb-4">
                      <Plus className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-gray-400" />
                    </div>
                    <h3 className="text-gray-400 font-semibold text-sm sm:text-base lg:text-lg">
                      {t('profile.add_new')}
                    </h3>
                  </CardContent>
                </Card>
              </DialogTrigger>
              
              <DialogContent className="bg-black/90 backdrop-blur-sm border border-red-500/20 text-white max-w-md mx-auto">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold bg-gradient-to-r from-red-500 to-red-400 bg-clip-text text-transparent">
                    {t('profile.create_new')}
                  </DialogTitle>
                </DialogHeader>
                
                <div className="space-y-4 sm:space-y-6">
                  {/* Avatar Upload */}
                  <div className="text-center">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center overflow-hidden mb-3 sm:mb-4">
                      {previewUrl ? (
                        <img 
                          src={previewUrl} 
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
                      )}
                    </div>
                    
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    
                    <div className="flex gap-2 justify-center">
                      <Button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        variant="outline"
                        size="sm"
                        className="border-red-500 text-red-400 hover:bg-red-500 hover:text-white"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        {t('profile.choose_image')}
                      </Button>
                      
                      {selectedFile && (
                        <Button
                          type="button"
                          onClick={resetFileSelection}
                          variant="outline"
                          size="sm"
                          className="border-gray-500 text-gray-400 hover:bg-gray-500 hover:text-white"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-gray-300">{t('profile.name')}</Label>
                    <Input
                      id="name"
                      value={newProfileName}
                      onChange={(e) => setNewProfileName(e.target.value)}
                      placeholder={t('profile.name_placeholder')}
                      className="bg-gray-800/50 border-gray-600 text-white focus:border-red-500"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="is-adult" className="text-gray-300">{t('profile.adult_profile')}</Label>
                    <Switch
                      id="is-adult"
                      checked={newProfileIsAdult}
                      onCheckedChange={setNewProfileIsAdult}
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      onClick={handleCreateProfile}
                      disabled={!newProfileName.trim() || isLoading}
                      className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
                    >
                      {isLoading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      ) : (
                        <Save className="w-4 h-4 mr-2" />
                      )}
                      {t('profile.create')}
                    </Button>
                    
                    <Button
                      onClick={() => {
                        setShowCreateDialog(false);
                        setNewProfileName('');
                        setNewProfileIsAdult(false);
                        resetFileSelection();
                      }}
                      variant="outline"
                      className="border-gray-600 text-gray-400 hover:bg-gray-600 hover:text-white"
                    >
                      {t('common.cancel')}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Edit Profile Dialog */}
        <Dialog open={!!editingProfile} onOpenChange={() => setEditingProfile(null)}>
          <DialogContent className="bg-black/90 backdrop-blur-sm border border-red-500/20 text-white max-w-md mx-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold bg-gradient-to-r from-red-500 to-red-400 bg-clip-text text-transparent">
                {t('profile.edit_profile')}
              </DialogTitle>
            </DialogHeader>
            
            {editingProfile && (
              <div className="space-y-4 sm:space-y-6">
                {/* Avatar Upload */}
                <div className="text-center">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center overflow-hidden mb-3 sm:mb-4">
                    {previewUrl ? (
                      <img 
                        src={previewUrl} 
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
                    )}
                  </div>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  
                  <div className="flex gap-2 justify-center">
                    <Button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      variant="outline"
                      size="sm"
                      className="border-red-500 text-red-400 hover:bg-red-500 hover:text-white"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {t('profile.change_image')}
                    </Button>
                    
                    {selectedFile && (
                      <Button
                        type="button"
                        onClick={resetFileSelection}
                        variant="outline"
                        size="sm"
                        className="border-gray-500 text-gray-400 hover:bg-gray-500 hover:text-white"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-name" className="text-gray-300">{t('profile.name')}</Label>
                  <Input
                    id="edit-name"
                    value={editingProfile.name}
                    onChange={(e) => setEditingProfile({...editingProfile, name: e.target.value})}
                    placeholder={t('profile.name_placeholder')}
                    className="bg-gray-800/50 border-gray-600 text-white focus:border-red-500"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="edit-is-adult" className="text-gray-300">{t('profile.adult_profile')}</Label>
                  <Switch
                    id="edit-is-adult"
                    checked={editingProfile.is_adult}
                    onCheckedChange={(checked) => setEditingProfile({...editingProfile, is_adult: checked})}
                  />
                </div>

                {/* PIN Management Section */}
                <div className="border-t border-gray-600 pt-4">
                  <Label className="text-gray-300 mb-3 block">{t('profile.pin_protected')}</Label>
                  <div className="flex gap-2">
                    {!editingProfile.pin_code ? (
                      <Button
                        onClick={() => handleSetPin(editingProfile)}
                        variant="outline"
                        size="sm"
                        className="border-yellow-500 text-yellow-400 hover:bg-yellow-500 hover:text-black"
                      >
                        <Lock className="w-4 h-4 mr-2" />
                        {t('profile.set_pin')}
                      </Button>
                    ) : (
                      <>
                        <Button
                          onClick={() => handleChangePin(editingProfile)}
                          variant="outline"
                          size="sm"
                          className="border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white"
                        >
                          <Edit2 className="w-4 h-4 mr-2" />
                          {t('profile.change_pin')}
                        </Button>
                        <Button
                          onClick={() => handleRemovePin(editingProfile)}
                          variant="outline"
                          size="sm"
                          className="border-gray-500 text-gray-400 hover:bg-gray-500 hover:text-white"
                        >
                          <Unlock className="w-4 h-4 mr-2" />
                          {t('profile.remove_pin')}
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={handleUpdateProfile}
                    disabled={!editingProfile.name.trim() || isLoading}
                    className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
                  >
                    {isLoading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    {t('common.save')}
                  </Button>
                  
                  <Button
                    onClick={() => {
                      setEditingProfile(null);
                      resetFileSelection();
                    }}
                    variant="outline"
                    className="border-gray-600 text-gray-400 hover:bg-gray-600 hover:text-white"
                  >
                    {t('common.cancel')}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* PIN Dialog */}
        <ProfilePinDialog
          open={pinDialogOpen}
          onOpenChange={setPinDialogOpen}
          profile={selectedProfileForPin}
          mode={pinDialogMode}
          onSuccess={handlePinSuccess}
          onVerified={handlePinVerified}
        />

        {selectedProfile && (
          <div className="text-center">
            <Button
              onClick={() => {
                // Navigate to main app
                window.location.href = '/';
              }}
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-8 sm:px-12 py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg shadow-lg transition-all duration-300 hover:scale-105"
            >
              {t('profile.continue_with')} {selectedProfile.name}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileSelector;
