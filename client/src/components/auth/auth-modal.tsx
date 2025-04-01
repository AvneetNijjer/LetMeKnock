import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SignInForm from './sign-in-form';
import SignUpForm from './sign-up-form';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');

  const handleSuccess = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl">
            {activeTab === 'signin' ? 'Welcome Back' : 'Create an Account'}
          </DialogTitle>
          <DialogDescription className="text-center">
            {activeTab === 'signin' 
              ? 'Sign in to your account to access your profile and saved properties.'
              : 'Join LetMeIKnock to find your perfect student housing near McMaster.'
            }
          </DialogDescription>
        </DialogHeader>

        <Tabs 
          defaultValue="signin" 
          value={activeTab} 
          onValueChange={(value) => setActiveTab(value as 'signin' | 'signup')}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          
          <TabsContent value="signin">
            <SignInForm onSuccess={handleSuccess} />
          </TabsContent>
          
          <TabsContent value="signup">
            <SignUpForm onSuccess={handleSuccess} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}