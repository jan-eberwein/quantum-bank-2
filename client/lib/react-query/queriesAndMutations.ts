import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {login, logout} from "@/lib/api/authApi";
import {ApiResponse, User} from "@/types/index";
import {fetchLoggedInUser} from "@/lib/api/userApi";

/*export const useCreateUserAccount = () => {
    return useMutation({
        mutationFn: (user: INewUser) =>
            fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(user),
            }).then(res => res.json()),
    });
};

export const useSignInAccount = () => {
    return useMutation({
        mutationFn: (user: { email: string; password: string }) =>
            fetch('/api/auth/signin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(user),
            }).then(res => res.json()),
    });
};*/

export const useLogin = () => {
    return useMutation({
        mutationFn: (user: { email: string; password: string }) =>
            login(user),
    });
};

export const useLogout = () => {
    return useMutation({
        mutationFn: logout,
    });
};

// Custom hook to fetch the currently logged-in user
export const useFetchLoggedInUser = (token: string) => {
    return useQuery<ApiResponse<User>, Error>({
        queryKey: ["loggedInUser"], // Cache key for React Query
        queryFn: () => fetchLoggedInUser(token),
        enabled: !!token, // Only run the query if the token exists
    });
};

/*export const useSignOutAccount = () => {
    return useMutation({
        mutationFn: () =>
            fetch('/api/auth/signout', { method: 'POST' }).then(res => res.json()),
    });
};*/

/*export const useGetUser = () => {
    return useQuery({
        queryKey: [QUERY_KEYS.GET_CURRENT_USER],
        queryFn: () => fetch('/api/user').then(res => res.json()),
    });
};*/

// Add other queries and mutations as needed

