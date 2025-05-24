"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { firestore } from '@/lib/firebaseConfig';
import { collection, query, where, orderBy, getDocs, Timestamp } from 'firebase/firestore';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton'; // For loading state
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info, Image as ImageIcon } from 'lucide-react';

interface ImageHistoryItem {
  id: string;
  imageUrl: string;
  prompt: string;
  flowType: string;
  createdAt: Timestamp; // Firestore Timestamp
  aspectRatio?: string;
  outputSize?: string;
  architecturalStyle?: string;
}

const FlowTypeBadge: React.FC<{ flowType: string }> = ({ flowType }) => {
  let variant: "default" | "secondary" | "destructive" | "outline" = "default";
  let text = flowType;

  switch (flowType) {
    case 'textToRender':
      variant = 'default'; // Blue-ish
      text = 'Text to Render';
      break;
    case 'sketchToRender':
      variant = 'secondary'; // Green-ish often
      text = 'Sketch to Render';
      break;
    case 'moodboardRender':
      variant = 'outline'; // More subtle
      text = 'Moodboard Render';
      break;
    default:
      text = flowType.charAt(0).toUpperCase() + flowType.slice(1);
  }
  return <Badge variant={variant}>{text}</Badge>;
};

export default function ImageHistory() {
  const { user, loading: authLoading } = useAuth();
  const [history, setHistory] = useState<ImageHistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) {
      // Wait for auth state to resolve
      setLoadingHistory(true);
      return;
    }

    if (!user) {
      setLoadingHistory(false);
      setHistory([]); // Clear history if user logs out
      return;
    }

    setLoadingHistory(true);
    setError(null);

    const imageHistoryCollection = collection(firestore, 'imageHistory');
    const q = query(
      imageHistoryCollection,
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    getDocs(q)
      .then((querySnapshot) => {
        const items: ImageHistoryItem[] = [];
        querySnapshot.forEach((doc) => {
          items.push({ id: doc.id, ...doc.data() } as ImageHistoryItem);
        });
        setHistory(items);
      })
      .catch((err) => {
        console.error("Error fetching image history:", err);
        setError("Failed to load image history. Please try again later.");
      })
      .finally(() => {
        setLoadingHistory(false);
      });
  }, [user, authLoading]);

  if (authLoading || loadingHistory) {
    return (
      <section className="mt-12">
        <h2 className="text-3xl font-bold tracking-tight mb-6">Your Image History</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <Skeleton className="h-[200px] w-full rounded-t-md" />
              <CardContent className="p-4">
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-3" />
                <Skeleton className="h-8 w-1/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    );
  }

  if (!user) {
    return (
      <section className="mt-12">
        <h2 className="text-3xl font-bold tracking-tight mb-6">Your Image History</h2>
         <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Not Logged In</AlertTitle>
          <AlertDescription>
            Please log in to view your image generation history.
          </AlertDescription>
        </Alert>
      </section>
    );
  }

  if (error) {
    return (
      <section className="mt-12">
        <h2 className="text-3xl font-bold tracking-tight mb-6">Your Image History</h2>
        <Alert variant="destructive">
          <Info className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </section>
    );
  }

  if (history.length === 0) {
    return (
      <section className="mt-12">
        <h2 className="text-3xl font-bold tracking-tight mb-6">Your Image History</h2>
        <Alert>
          <ImageIcon className="h-4 w-4" />
          <AlertTitle>No Images Yet</AlertTitle>
          <AlertDescription>
            You haven't generated any images yet. Try one of the tools above!
          </AlertDescription>
        </Alert>
      </section>
    );
  }

  return (
    <section className="mt-12">
      <h2 className="text-3xl font-bold tracking-tight mb-8">Your Image History</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {history.map((item) => (
          <Card key={item.id} className="overflow-hidden flex flex-col">
            <CardHeader className="p-0">
              <div className="relative aspect-video w-full">
                <Image
                  src={item.imageUrl}
                  alt={item.prompt || 'Generated image'}
                  layout="fill"
                  objectFit="cover"
                  className="bg-muted"
                />
              </div>
            </CardHeader>
            <CardContent className="p-4 flex-grow flex flex-col justify-between">
              <div>
                <CardDescription className="text-xs text-muted-foreground mb-1">
                  {item.createdAt?.toDate().toLocaleDateString()} - {item.createdAt?.toDate().toLocaleTimeString()}
                </CardDescription>
                <p className="text-sm font-medium leading-snug truncate mb-2" title={item.prompt}>
                  {item.prompt}
                </p>
              </div>
              <div className="mt-auto">
                 <FlowTypeBadge flowType={item.flowType} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
