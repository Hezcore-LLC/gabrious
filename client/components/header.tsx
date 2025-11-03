"use client";

import React, { useState, useEffect } from "react";
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
import { 
  BookOpen, 
  Church, 
  FileText, 
  Home, 
  Menu, 
  LogOut, 
  User, 
  Settings,
  Sparkles,
  Zap,
  Crown
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { authService } from "@/lib/authService";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function Header() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsAuthenticated(authService.isAuthenticated());
    
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    authService.logout();
    setIsAuthenticated(false);
    router.push("/");
  };

  return (
    <motion.header 
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        scrolled 
          ? "border-b bg-background/80 backdrop-blur-xl shadow-lg" 
          : "border-b border-transparent bg-background/60 backdrop-blur-md"
      )}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="container flex h-20 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <motion.div 
            className="relative"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-lg blur-md opacity-50 group-hover:opacity-75 transition-opacity" />
            <div className="relative flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-yellow-600 shadow-lg">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
          </motion.div>
          <div className="flex flex-col">
            <span className="font-bold text-xl bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent">
              Gabrious
            </span>
            <span className="text-[10px] text-muted-foreground -mt-1">AI Study Platform</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex md:items-center md:gap-8">
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <Link href="/" legacyBehavior passHref>
                  <NavigationMenuLink className={cn(navigationMenuTriggerStyle(), "text-base")}>
                    <Home className="h-4 w-4 mr-2" />
                    Home
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
              
              <NavigationMenuItem>
                <NavigationMenuTrigger className="text-base">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Features
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid gap-3 p-6 md:w-[500px] lg:w-[600px] lg:grid-cols-2">
                    <li className="row-span-3">
                      <NavigationMenuLink asChild>
                        <a
                          className="flex h-full w-full select-none flex-col justify-end rounded-xl bg-gradient-to-br from-amber-500/10 to-yellow-500/10 p-6 no-underline outline-none focus:shadow-md hover:shadow-lg transition-all border-2 border-amber-500/20"
                          href="/upload"
                        >
                          <Zap className="h-8 w-8 text-amber-600 mb-2" />
                          <div className="mb-2 mt-4 text-lg font-semibold">
                            AI Transcription
                          </div>
                          <p className="text-sm leading-tight text-muted-foreground">
                            Convert sermons to text with 99% accuracy using advanced AI
                          </p>
                          <Badge className="mt-3 w-fit bg-amber-500/10 text-amber-700 hover:bg-amber-500/20">
                            Most Popular
                          </Badge>
                        </a>
                      </NavigationMenuLink>
                    </li>
                    <ListItem 
                      href="/dashboard" 
                      title="Study Notes" 
                      icon={<BookOpen className="h-4 w-4 mr-2 text-amber-600" />}
                    >
                      Comprehensive notes with key insights and scripture references
                    </ListItem>
                    <ListItem 
                      href="/how-it-works" 
                      title="How It Works" 
                      icon={<FileText className="h-4 w-4 mr-2 text-amber-600" />}
                    >
                      Learn how our AI transforms sermons into study materials
                    </ListItem>
                    <ListItem 
                      href="/pricing" 
                      title="Pricing Plans" 
                      icon={<Crown className="h-4 w-4 mr-2 text-amber-600" />}
                    >
                      Choose the perfect plan for your needs
                    </ListItem>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
              
              <NavigationMenuItem>
                <Link href="/pricing" legacyBehavior passHref>
                  <NavigationMenuLink className={cn(navigationMenuTriggerStyle(), "text-base")}>
                    <Crown className="h-4 w-4 mr-2" />
                    Pricing
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
              
              {isAuthenticated && (
                <NavigationMenuItem>
                  <Link href="/dashboard" legacyBehavior passHref>
                    <NavigationMenuLink className={cn(navigationMenuTriggerStyle(), "text-base")}>
                      Dashboard
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
              )}
            </NavigationMenuList>
          </NavigationMenu>
          
          <div className="flex items-center gap-3">
            <ModeToggle />
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full ring-2 ring-amber-500/20 hover:ring-amber-500/40 transition-all">
                    <Avatar>
                      <AvatarFallback className="bg-gradient-to-br from-amber-500 to-yellow-600 text-white">
                        <User className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-semibold">My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      Profile & Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="cursor-pointer">
                      <BookOpen className="mr-2 h-4 w-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button variant="ghost" asChild className="text-base">
                  <Link href="/auth/login">Log in</Link>
                </Button>
                <Button asChild className="text-base bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 shadow-lg hover:shadow-xl transition-all">
                  <Link href="/auth/signup">
                    Get Started
                    <Sparkles className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="flex items-center gap-3 md:hidden">
          <ModeToggle />
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <div className="flex flex-col gap-8 py-6">
                {/* Mobile Logo */}
                <Link href="/" className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-yellow-600 shadow-lg">
                    <BookOpen className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-xl bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent">
                      Gabrious
                    </span>
                    <span className="text-[10px] text-muted-foreground -mt-1">AI Study Platform</span>
                  </div>
                </Link>
                
                {/* Mobile Nav Links */}
                <nav className="flex flex-col gap-3">
                  <Link 
                    href="/" 
                    className="flex items-center gap-3 px-4 py-3 text-base font-medium rounded-lg hover:bg-muted transition-colors"
                  >
                    <Home className="h-5 w-5 text-amber-600" />
                    Home
                  </Link>
                  <Link 
                    href="/upload" 
                    className="flex items-center gap-3 px-4 py-3 text-base font-medium rounded-lg hover:bg-muted transition-colors"
                  >
                    <Zap className="h-5 w-5 text-amber-600" />
                    Upload Sermon
                  </Link>
                  <Link 
                    href="/how-it-works" 
                    className="flex items-center gap-3 px-4 py-3 text-base font-medium rounded-lg hover:bg-muted transition-colors"
                  >
                    <FileText className="h-5 w-5 text-amber-600" />
                    How It Works
                  </Link>
                  <Link 
                    href="/pricing" 
                    className="flex items-center gap-3 px-4 py-3 text-base font-medium rounded-lg hover:bg-muted transition-colors"
                  >
                    <Crown className="h-5 w-5 text-amber-600" />
                    Pricing
                  </Link>
                  {isAuthenticated && (
                    <>
                      <Link 
                        href="/dashboard" 
                        className="flex items-center gap-3 px-4 py-3 text-base font-medium rounded-lg hover:bg-muted transition-colors"
                      >
                        <BookOpen className="h-5 w-5 text-amber-600" />
                        Dashboard
                      </Link>
                      <Link 
                        href="/profile" 
                        className="flex items-center gap-3 px-4 py-3 text-base font-medium rounded-lg hover:bg-muted transition-colors"
                      >
                        <Settings className="h-5 w-5 text-amber-600" />
                        Profile & Settings
                      </Link>
                    </>
                  )}
                </nav>
                
                {/* Mobile Auth Buttons */}
                <div className="flex flex-col gap-3 pt-4 border-t">
                  {isAuthenticated ? (
                    <Button 
                      variant="outline" 
                      onClick={handleLogout} 
                      className="w-full justify-start text-destructive hover:text-destructive"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Log out
                    </Button>
                  ) : (
                    <>
                      <Button variant="outline" asChild className="w-full">
                        <Link href="/auth/login">Log in</Link>
                      </Button>
                      <Button asChild className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 shadow-lg">
                        <Link href="/auth/signup">
                          Get Started
                          <Sparkles className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </motion.header>
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
            "block select-none space-y-1 rounded-lg p-4 leading-none no-underline outline-none transition-all hover:bg-muted hover:shadow-md border border-transparent hover:border-amber-500/20",
            className
          )}
          {...props}
        >
          <div className="flex items-center text-sm font-semibold leading-none mb-2">
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
