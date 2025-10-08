
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface PinInputProps {
  pin: string;
  onPinChange: (pin: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
  title: string;
  isLoading?: boolean;
  showConfirmButton?: boolean;
}

export const PinInput: React.FC<PinInputProps> = ({
  pin,
  onPinChange,
  onConfirm,
  onCancel,
  title,
  isLoading = false,
  showConfirmButton = true
}) => {
  const { t, isRTL } = useLanguage();

  const handleNumberClick = (number: string) => {
    if (pin.length < 4) {
      onPinChange(pin + number);
    }
  };

  const handleBackspace = () => {
    onPinChange(pin.slice(0, -1));
  };

  const handleClear = () => {
    onPinChange('');
  };

  return (
    <div className="bg-black/90 backdrop-blur-sm border border-red-500/20 rounded-lg p-6 text-white max-w-sm mx-auto">
      <h3 className="text-lg font-bold text-center mb-6 bg-gradient-to-r from-red-500 to-red-400 bg-clip-text text-transparent">
        {title}
      </h3>
      
      {/* PIN Display */}
      <div className="flex justify-center gap-3 mb-8">
        {[0, 1, 2, 3].map((index) => (
          <div
            key={index}
            className="w-12 h-12 border-2 border-gray-600 rounded-lg flex items-center justify-center bg-gray-800/50"
          >
            <span className="text-xl text-white">
              {pin[index] ? '●' : ''}
            </span>
          </div>
        ))}
      </div>

      {/* Number Keypad */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((number) => (
          <Button
            key={number}
            onClick={() => handleNumberClick(number.toString())}
            className="h-14 text-xl font-semibold bg-gray-700 hover:bg-gray-600 border border-gray-600"
            disabled={pin.length >= 4}
          >
            {number}
          </Button>
        ))}
        
        {/* Zero and controls row */}
        <Button
          onClick={handleClear}
          className="h-14 text-sm bg-gray-700 hover:bg-gray-600 border border-gray-600"
          disabled={pin.length === 0}
        >
          {t('common.clear')}
        </Button>
        
        <Button
          onClick={() => handleNumberClick('0')}
          className="h-14 text-xl font-semibold bg-gray-700 hover:bg-gray-600 border border-gray-600"
          disabled={pin.length >= 4}
        >
          0
        </Button>
        
        <Button
          onClick={handleBackspace}
          className="h-14 bg-gray-700 hover:bg-gray-600 border border-gray-600 flex items-center justify-center"
          disabled={pin.length === 0}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        {showConfirmButton && (
          <Button
            onClick={onConfirm}
            disabled={pin.length !== 4 || isLoading}
            className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : null}
            {t('common.confirm')}
          </Button>
        )}
        
        <Button
          onClick={onCancel}
          variant="outline"
          className="border-gray-600 text-gray-400 hover:bg-gray-600 hover:text-white"
        >
          {t('common.cancel')}
        </Button>
      </div>
    </div>
  );
};
