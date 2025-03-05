"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { 
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { BookOpen, Church, FileText, Home, Menu, X } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <BookOpen className="h-6 w-6" />
            <span className="hidden font-bold sm:inline-block text-xl">Gabrious</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex md:items-center md:gap-6">
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <Link href="/" legacyBehavior passHref>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                    Home
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuTrigger>Features</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-2">
                    <li className="row-span-3">
                      <NavigationMenuLink asChild>
                        <a
                          className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                          href="/transcription"
                        >
                          <FileText className="h-6 w-6" />
                          <div className="mb-2 mt-4 text-lg font-medium">
                            Transcription
                          </div>
                          <p className="text-sm leading-tight text-muted-foreground">
                            Convert sermons to text with our AI-powered transcription service
                          </p>
                        </a>
                      </NavigationMenuLink>
                    </li>
                    <ListItem href="/study-notes" title="Study Notes" icon={<BookOpen className="h-4 w-4 mr-2" />}>
                      Generate comprehensive study notes from sermon transcriptions
                    </ListItem>
                    <ListItem href="/church-automation" title="Church Automation" icon={<Church className="h-4 w-4 mr-2" />}>
                      Automate sermon processing for your entire church
                    </ListItem>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link href="/pricing" legacyBehavior passHref>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                    Pricing
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link href="/dashboard" legacyBehavior passHref>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                    Dashboard
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
          
          <div className="flex items-center gap-4">
            <ModeToggle />
            <Button variant="outline" asChild>
              <Link href="/auth/login">Log in</Link>
            </Button>
            <Button asChild>
              <Link href="/auth/signup">Sign up</Link>
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="flex items-center gap-4 md:hidden">
          <ModeToggle />
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <div className="flex flex-col gap-6 py-6">
                <Link href="/" className="flex items-center gap-2">
                  <BookOpen className="h-6 w-6" />
                  <span className="font-bold text-xl">Gabrious</span>
                </Link>
                <nav className="flex flex-col gap-4">
                  <Link href="/" className="flex items-center gap-2 text-lg font-medium">
                    <Home className="h-5 w-5" />
                    Home
                  </Link>
                  <Link href="/transcription" className="flex items-center gap-2 text-lg font-medium">
                    <FileText className="h-5 w-5" />
                    Transcription
                  </Link>
                  <Link href="/study-notes" className="flex items-center gap-2 text-lg font-medium">
                    <BookOpen className="h-5 w-5" />
                    Study Notes
                  </Link>
                  <Link href="/church-automation" className="flex items-center gap-2 text-lg font-medium">
                    <Church className="h-5 w-5" />
                    Church Automation
                  </Link>
                  <Link href="/pricing" className="flex items-center gap-2 text-lg font-medium">
                    Pricing
                  </Link>
                  <Link href="/dashboard" className="flex items-center gap-2 text-lg font-medium">
                    Dashboard
                  </Link>
                </nav>
                <div className="flex flex-col gap-2">
                  <Button variant="outline" asChild className="w-full">
                    <Link href="/auth/login">Log in</Link>
                  </Button>
                  <Button asChild className="w-full">
                    <Link href="/auth/signup">Sign up</Link>
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a"> & { icon?: React.ReactNode }
>(({ className, title, children, icon, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="flex items-center text-sm font-medium leading-none">
            {icon}
            {title}
          </div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";