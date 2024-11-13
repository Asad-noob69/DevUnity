"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";
import { CgMenuRight } from "react-icons/cg";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { usePathname } from "next/navigation";
import { useAuth } from "./context/authContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const AuthModal = ({ isOpen, onOpenChange }: { isOpen: boolean; onOpenChange: (open: boolean) => void }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const { login, register } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    username: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSignUp) {
      await register(formData);
    } else {
      await login(formData);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-zinc-900 border-zinc-800">
        <DialogHeader>
          <DialogTitle className="text-white">
            {isSignUp ? "Create an account" : "Sign in to DevUnity"}
          </DialogTitle>
          <DialogDescription className="text-zinc-400">
            {isSignUp
              ? "Join our community of developers"
              : "Welcome back! Please enter your details"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <input
              type="text"
              placeholder="Username"
              className="w-full p-2 rounded bg-zinc-800 text-white border border-zinc-700"
              value={formData.username}
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
            />
          )}
          <input
            type="email"
            placeholder="Email"
            className="w-full p-2 rounded bg-zinc-800 text-white border border-zinc-700"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full p-2 rounded bg-zinc-800 text-white border border-zinc-700"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
          />
          <Button
            type="submit"
            className="w-full bg-[#9CE630] text-black hover:bg-[#8BD520]"
          >
            {isSignUp ? "Sign up" : "Sign in"}
          </Button>
          <p className="text-center text-zinc-400">
            {isSignUp ? "Already have an account? " : "Don't have an account? "}
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-[#9CE630] hover:underline"
            >
              {isSignUp ? "Sign in" : "Sign up"}
            </button>
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const closeSheet = () => setIsOpen(false);

  const linkClasses = (path: string) =>
    pathname === path ? "text-white" : "text-zinc-400 hover:text-white";

  return (
    <nav className="border-b z-50 absolute w-full bg-black/50 border-zinc-800">
      <div className="container mx-auto flex items-center justify-between p-4 lg:px-6">
        <Link className="flex items-center space-x-2" href="/">
          <Users className="h-8 w-8 text-[#9CE630]" />
          <span className="text-xl font-bold text-white">DevUnity</span>
        </Link>
        <div className="hidden lg:flex items-center space-x-6">
          <Link className={linkClasses("/explore")} href="/explore">
            Explore
          </Link>
          <Link className={linkClasses("/community")} href="/community">
            Community
          </Link>
          <Link className={linkClasses("/blogs")} href="/blogs">
            Blog
          </Link>
          <Link className={linkClasses("/about")} href="/about">
            About
          </Link>
          <Link className={linkClasses("/question")} href="/question">
            Questions
          </Link>
        </div>
        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <span className="text-white hidden lg:block">
                Welcome, {user.username}!
              </span>
              <Button
                onClick={logout}
                className="text-gray-700 hover:text-black bg-white hover:bg-white/80"
              >
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={() => setIsAuthModalOpen(true)}
                className="text-gray-700 hover:text-black bg-white hover:bg-white/80"
              >
                Sign in
              </Button>
              <Button
                onClick={() => {
                  setIsAuthModalOpen(true);
                  setIsSignUp(true);
                }}
                className="bg-[#9CE630] text-black hover:bg-[#8BD520] hidden lg:block"
              >
                Sign up
              </Button>
            </>
          )}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <CgMenuRight className="h-6 w-6 text-white" />
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-[300px] sm:w-[400px] bg-zinc-900 border-none"
            >
              {/* ... rest of the sheet content remains the same ... */}
            </SheetContent>
          </Sheet>
        </div>
      </div>
      <AuthModal isOpen={isAuthModalOpen} onOpenChange={setIsAuthModalOpen} />
    </nav>
  );
};

export default Navbar;