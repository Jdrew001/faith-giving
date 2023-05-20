import {
    CollectionReference,
    DocumentData, FirestoreDataConverter, QueryDocumentSnapshot, SnapshotOptions
  } from "firebase/firestore";

export class FirestoreConverter<T> {
    converter: FirestoreDataConverter<T>;

    constructor() {
      this.converter = {
        toFirestore: (data: T) => {
          // Implement the conversion logic from data to Firestore document data
          // Return the converted document data
          // Example:
          return { ...data };
        },
        fromFirestore(
            snapshot: QueryDocumentSnapshot,
            options: SnapshotOptions
        ): T {
            const data = snapshot.data(options)!;
            return {...data} as T;
        }
      };
    }
  
    convertToFirestore(data: T): DocumentData {
      return this.converter.toFirestore(data);
    }
  
    convertFromFirestore(snapshot: QueryDocumentSnapshot<T>): T {
      return this.converter.fromFirestore(snapshot);
    }
}