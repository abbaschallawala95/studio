'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Header from '@/components/layout/header';
import { AppSidebar } from '@/components/layout/sidebar';
import { SidebarInset } from '@/components/ui/sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Edit, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore, useDoc, setDocumentNonBlocking, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { UserProfile } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProfilePage() {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();
    const [isSaving, setIsSaving] = useState(false);

    const userProfileRef = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return doc(firestore, 'users', user.uid);
    }, [user, firestore]);
    
    const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userProfileRef);

    const { register, handleSubmit, setValue, watch } = useForm<UserProfile>({
        defaultValues: {
            trackerName: 'My eScotty',
            trackerImage: null,
        }
    });

    const trackerImage = watch('trackerImage');
    const trackerName = watch('trackerName');

    useEffect(() => {
        if (userProfile) {
            setValue('trackerName', userProfile.trackerName || 'My eScotty');
            setValue('trackerImage', userProfile.trackerImage || null);
        }
    }, [userProfile, setValue]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setValue('trackerImage', event.target?.result as string);
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const onSubmit = (data: UserProfile) => {
        if (!user || !firestore) return;
        setIsSaving(true);
        const profileData = {
            trackerName: data.trackerName,
            trackerImage: data.trackerImage || null,
        };

        setDocumentNonBlocking(userProfileRef!, profileData, { merge: true });

        toast({
            title: 'Profile Updated',
            description: 'Your tracker settings have been saved.',
        });
        setIsSaving(false);
    };

    if (isUserLoading || isProfileLoading) {
        return (
             <div className="flex min-h-screen w-full flex-col bg-background">
                <AppSidebar />
                <SidebarInset>
                    <Header />
                    <main className="flex-1 p-4 sm:p-6 lg:p-8 pt-0">
                        <div className="mx-auto max-w-2xl">
                             <Card>
                                <CardHeader>
                                    <Skeleton className="h-8 w-48" />
                                    <Skeleton className="h-4 w-64 mt-2" />
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="flex flex-col sm:flex-row items-center gap-6">
                                        <Skeleton className="h-24 w-24 rounded-full" />
                                        <div className="w-full flex-1 space-y-2">
                                            <Skeleton className="h-6 w-24" />
                                            <Skeleton className="h-10 w-full" />
                                        </div>
                                    </div>
                                    <div className="flex justify-end">
                                        <Skeleton className="h-10 w-32" />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </main>
                </SidebarInset>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen w-full flex-col bg-background">
            <AppSidebar />
            <SidebarInset>
                <Header />
                <main className="flex-1 p-4 sm:p-6 lg:p-8 pt-0">
                    <div className="mx-auto max-w-2xl">
                        <form onSubmit={handleSubmit(onSubmit)}>
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
                                                <AvatarFallback>{trackerName?.charAt(0) || 'E'}</AvatarFallback>
                                            </Avatar>
                                            <Label htmlFor="image-upload" className="absolute bottom-0 right-0 cursor-pointer rounded-full bg-primary p-1.5 text-primary-foreground hover:bg-primary/90">
                                                <Edit className="h-3 w-3" />
                                            </Label>
                                            <Input id="image-upload" type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                                        </div>
                                        <div className="w-full flex-1 space-y-2">
                                            <Label htmlFor="tracker-name">Tracker Name</Label>
                                            <Input id="tracker-name" {...register('trackerName')} />
                                        </div>
                                    </div>
                                    <div className="flex justify-end">
                                        <Button type="submit" disabled={isSaving}>
                                            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            Save Changes
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </form>
                    </div>
                </main>
            </SidebarInset>
        </div>
    );
}
