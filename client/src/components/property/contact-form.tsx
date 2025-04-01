import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { X } from 'lucide-react';
import { useAuth } from '@/context/auth-context';

// Schema for email contact form
const emailSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().optional(),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

// Schema for in-app messaging
const messageSchema = z.object({
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

interface ContactFormProps {
  propertyId: number;
  ownerId: number;
  propertyTitle: string;
  contactMethod: 'email' | 'message';
  onSuccess: () => void;
}

export default function ContactForm({ 
  propertyId, 
  ownerId, 
  propertyTitle,
  contactMethod,
  onSuccess
}: ContactFormProps) {
  const { toast } = useToast();
  const { user } = useAuth();

  // Email form setup
  const emailForm = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      name: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : '',
      email: user?.email || '',
      phone: '',
      message: `I'm interested in "${propertyTitle}" and would like to schedule a viewing.`
    },
  });

  // Message form setup
  const messageForm = useForm<z.infer<typeof messageSchema>>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      message: `I'm interested in "${propertyTitle}" and would like to schedule a viewing.`
    },
  });

  async function onSubmitEmail(values: z.infer<typeof emailSchema>) {
    try {
      // In a real implementation, you would send this data to your backend
      console.log('Email contact form submitted:', values);
      
      // Simulate API call success
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: 'Message sent!',
        description: 'The property owner will contact you soon.',
      });
      
      onSuccess();
    } catch (error) {
      console.error('Error sending email:', error);
      toast({
        variant: 'destructive',
        title: 'Failed to send message',
        description: 'There was an error sending your message. Please try again.',
      });
    }
  }

  async function onSubmitMessage(values: z.infer<typeof messageSchema>) {
    try {
      // In a real implementation, you would send this to your messaging system
      console.log('In-app message submitted:', {
        ...values,
        propertyId,
        ownerId,
        senderId: user?.id,
      });
      
      // Simulate API call success
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: 'Message sent!',
        description: 'You can view your conversation in your messages.',
      });
      
      onSuccess();
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        variant: 'destructive',
        title: 'Failed to send message',
        description: 'There was an error sending your message. Please try again.',
      });
    }
  }

  return (
    <div className="w-full p-4 border rounded-lg space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-lg">
          {contactMethod === 'email' ? 'Contact via Email' : 'Send a Message'}
        </h3>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onSuccess} 
          className="h-6 w-6"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {contactMethod === 'email' ? (
        <Form {...emailForm}>
          <form onSubmit={emailForm.handleSubmit(onSubmitEmail)} className="space-y-4">
            <FormField
              control={emailForm.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Full name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={emailForm.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="Your email" type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={emailForm.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Your phone number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={emailForm.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Tell the owner about yourself and why you're interested" 
                      rows={4}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end pt-2">
              <Button 
                type="submit" 
                disabled={emailForm.formState.isSubmitting}
              >
                {emailForm.formState.isSubmitting ? 'Sending...' : 'Send Email'}
              </Button>
            </div>
          </form>
        </Form>
      ) : (
        <Form {...messageForm}>
          <form onSubmit={messageForm.handleSubmit(onSubmitMessage)} className="space-y-4">
            <FormField
              control={messageForm.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Tell the owner about yourself and why you're interested" 
                      rows={4}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end pt-2">
              <Button 
                type="submit" 
                disabled={messageForm.formState.isSubmitting}
              >
                {messageForm.formState.isSubmitting ? 'Sending...' : 'Send Message'}
              </Button>
            </div>
          </form>
        </Form>
      )}
    </div>
  );
}