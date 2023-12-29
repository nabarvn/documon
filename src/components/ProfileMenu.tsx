import Link from "next/link";
import Image from "next/image";
import { Icons } from "@/components";
import { Button } from "@/components/ui";
import { getUserSubscriptionPlan } from "@/lib/stripe";
import { Avatar, AvatarFallback } from "@/components/ui/Avatar";
import { LogoutLink } from "@kinde-oss/kinde-auth-nextjs/server";
import { CreditCard, Gem, Github, LayoutDashboard, LogOut } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";

interface ProfileMenuProps {
  name: string;
  email: string | undefined;
  imageUrl: string;
}

const ProfileMenu = async ({ name, email, imageUrl }: ProfileMenuProps) => {
  const subscriptionPlan = await getUserSubscriptionPlan();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className='overflow-visible'>
        <Button className='rounded-full h-8 w-8 aspect-square bg-slate-400'>
          <Avatar className='relative h-8 w-8'>
            {imageUrl ? (
              <div className='relative aspect-square h-full w-full'>
                <Image
                  fill
                  src={imageUrl}
                  alt='profile picture'
                  referrerPolicy='no-referrer'
                />
              </div>
            ) : (
              <AvatarFallback>
                <span className='sr-only'>{name}</span>
                <Icons.user className='h-4 w-4 text-zinc-900' />
              </AvatarFallback>
            )}
          </Avatar>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className='bg-white' align='end'>
        <div className='flex items-center justify-start gap-2 p-2'>
          <div className='flex flex-col space-y-0.5 leading-none'>
            {name && <p className='font-medium text-sm text-black'>{name}</p>}

            {email && (
              <p className='w-[200px] truncate text-xs text-zinc-700'>
                {email}
              </p>
            )}
          </div>
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link href='/dashboard'>
            <LayoutDashboard className='h-4 w-4 mr-2' />
            Dashboard
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          {subscriptionPlan?.isSubscribed ? (
            <Link href='/dashboard/billing'>
              <CreditCard className='h-4 w-4 mr-2' />
              Manage Subscription
            </Link>
          ) : (
            <Link href='/pricing'>
              <Gem className='text-blue-600 h-4 w-4 mr-2' />
              Upgrade
            </Link>
          )}
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link target='_blank' href='https://github.com/nabarvn/documon'>
            <Github className='h-4 w-4 mr-2' />
            Star on GitHub
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem className='cursor-pointer'>
          <LogoutLink className='flex'>
            <LogOut className='self-center h-4 w-4 mr-2' />
            Log out
          </LogoutLink>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ProfileMenu;
