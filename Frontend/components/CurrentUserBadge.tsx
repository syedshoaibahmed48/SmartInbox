import { CurrentUser } from "@/lib/types";
import { Button } from "./ui/button";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "./ui/hover-card";

export default function CurrentUserBadge({ user }: { user: CurrentUser }) {
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
                <div className="space-y-2">
                    <p className="font-medium text-gray-900">{user.name}</p>
                    <p className="text-sm text-gray-600">{user.email}</p>
                </div>
            </HoverCardContent>
        </HoverCard>
    );
}