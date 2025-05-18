export interface UserProfile {
    $id: string;
    userId: string;
    email: string;
    profileImageId: string | null;
    balance: number;
    cardNumber: string;
}
