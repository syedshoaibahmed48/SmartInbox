import { CurrentUser } from "@/lib/types";
import { Button } from "./ui/button";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "./ui/hover-card";
import { apiClient } from "@/lib/apiClient";
import { toast } from "sonner";

export default function CurrentUserBadge({ user }: { user: CurrentUser }) {
    async function handleLogout() {
        try {
            await apiClient('/api/auth/logout', { method: 'POST' }, true);
            // Redirect to home after logout
            window.location.href = '/';
        } catch (err: any) {
            toast.error(err?.message || 'Logout failed.');
        }
    }
    return (
        <HoverCard>
            <HoverCardTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 rounded-full bg-gray-100 hover:bg-gray-200">
                    <span className="text-sm font-medium text-gray-700">
                        {user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()}
                    </span>
                </Button>
            </HoverCardTrigger>
            <HoverCardContent className="w-64 bg-white" align="end">
                <div className="">
                    <p className="font-medium text-gray-900">{user.name}</p>
                    <p className="text-sm text-gray-600">{user.email}</p>
                    <div className="w-full mt-2">
                        <Button variant="default" onClick={handleLogout} className="bg-red-500 hover:bg-red-700 text-white">
                            Logout
                        </Button>
                    </div>
                </div>
            </HoverCardContent>
        </HoverCard>
    );
}