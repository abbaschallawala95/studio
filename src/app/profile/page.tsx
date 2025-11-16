'use client';

import { useState } from 'react';
import Header from '@/components/layout/header';
import { AppSidebar } from '@/components/layout/sidebar';
import { SidebarInset } from '@/components/ui/sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ProfilePage() {
    const [trackerName, setTrackerName] = useState('My eScotty');
    const [trackerImage, setTrackerImage] = useState<string | null>(null);
    const { toast } = useToast();

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTrackerName(e.target.value);
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
        const reader = new FileReader();
        reader.onload = (event) => {
            setTrackerImage(event.target?.result as string);
        };
        reader.readAsDataURL(e.target.files[0]);
        }
    };

    const handleSaveChanges = () => {
        // Here you would typically save the data to your backend (e.g., Firestore)
        toast({
        title: 'Profile Updated',
        description: 'Your tracker settings have been saved.',
        });
    };
    
  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <AppSidebar />
      <SidebarInset>
        <Header />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
            <div className="mx-auto max-w-2xl">
                <Card>
                    <CardHeader>
                        <CardTitle>Profile Settings</CardTitle>
                        <CardDescription>Update your tracker's name and image.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex flex-col sm:flex-row items-center gap-6">
                            <div className="relative">
                                <Avatar className="h-24 w-24 sm:h-20 sm:w-20">
                                    <AvatarImage src={trackerImage || "https://picsum.photos/seed/scooter/200/200"} alt="Tracker" data-ai-hint="electric scooter"/>
                                    <AvatarFallback>ES</AvatarFallback>
                                </Avatar>
                                <Label htmlFor="image-upload" className="absolute bottom-0 right-0 cursor-pointer rounded-full bg-primary p-1.5 text-primary-foreground hover:bg-primary/90">
                                    <Edit className="h-3 w-3" />
                                </Label>
                                <Input id="image-upload" type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                            </div>
                            <div className="w-full flex-1 space-y-2">
                                <Label htmlFor="tracker-name">Tracker Name</Label>
                                <Input id="tracker-name" value={trackerName} onChange={handleNameChange} />
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <Button onClick={handleSaveChanges}>Save Changes</Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </main>
      </SidebarInset>
    </div>
  );
}
