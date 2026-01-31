"use client";

import { useEffect } from "react";
import { errorEmitter } from "@/firebase/error-emitter";
import { useToast } from "@/hooks/use-toast";
import { FirestorePermissionError } from "@/firebase/errors";

export default function FirebaseErrorListener() {
  const { toast } = useToast();

  useEffect(() => {
    const handlePermissionError = (error: FirestorePermissionError) => {
      console.error("Firestore Permission Error:", error.toContextObject());
      
      let description = `Operation: ${error.operation.toUpperCase()} on path ${error.path}.`;
      if (process.env.NODE_ENV === 'development') {
        description += ` Check browser console for details.`
      }

      toast({
        variant: "destructive",
        title: "Firestore: Insufficient Permissions",
        description: description,
        duration: 10000,
      });
    };

    errorEmitter.on("permission-error", handlePermissionError);

  }, [toast]);

  return null;
}
