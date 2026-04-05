"use client";

import { useEffect, useRef, useState } from "react";
import { Navbar, NavbarBrand, NavbarContent, NavbarItem } from "@heroui/navbar";
import Link from "next/link";
import { Avatar, AvatarGroup, AvatarIcon } from "@heroui/avatar";
import { Tooltip } from "@heroui/tooltip";
import { Input } from "@heroui/input";
import { Bell, Home, SearchIcon, Users } from "lucide-react";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";
import { useClerk } from "@clerk/nextjs";
import { usePathname, useRouter } from "next/navigation";
import { useGlobalSearch } from "@/app/(app)/search/_hooks/useGlobalSearch";
import { useMyProfile } from "@/app/hooks/queries/useMyProfile";

const navItems = [
  {
    label: "Feed",
    href: "/feed",
    icon: Home,
  },
  {
    label: "Connections",
    href: "/connections",
    icon: Users,
  },
];

interface AppNavbarProps {
  onSearchFocusChange: (focused: boolean) => void;
}

const AppNavbar = ({ onSearchFocusChange }: AppNavbarProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [debouncedSearchText, setDebouncedSearchText] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const searchWrapperRef = useRef<HTMLDivElement | null>(null);
  const { signOut } = useClerk();
  const { data: profile } = useMyProfile();
  const router = useRouter();
  const pathname = usePathname();

  const trimmedSearchText = searchText.trim();
  const canSearch = trimmedSearchText.length >= 2;

  const { data, isLoading } = useGlobalSearch(debouncedSearchText, 8);
  const users = data?.users ?? [];

  const totalOptions = users.length + 1; // users + "See all results"
  const isDropdownOpen = isFocused && canSearch;

  const navigateToAllResults = () => {
    const keyword = searchText.trim();
    if (keyword.length < 2) return;
    router.push(`/search/results/all?keyword=${encodeURIComponent(keyword)}`);
    setIsFocused(false);
    onSearchFocusChange(false);
    inputRef.current?.blur();
  };

  const handleSearchSubmit = () => {
    if (!canSearch) return;

    if (highlightedIndex < users.length) {
      const selectedUser = users[highlightedIndex];
      router.push(`/u/${selectedUser.clerk_id}`);
      setIsFocused(false);
      onSearchFocusChange(false);
      inputRef.current?.blur();
      return;
    }

    navigateToAllResults();
  };

  // Keyboard shortcut "/"
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/" && document.activeElement !== inputRef.current) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedSearchText(trimmedSearchText);
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [trimmedSearchText]);

  useEffect(() => {
    if (!isDropdownOpen) return;
    setHighlightedIndex(0);
  }, [debouncedSearchText, isDropdownOpen]);

  useEffect(() => {
    setIsFocused(false);
    onSearchFocusChange(false);
  }, [pathname, onSearchFocusChange]);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!searchWrapperRef.current) return;
      if (searchWrapperRef.current.contains(event.target as Node)) return;

      setIsFocused(false);
      onSearchFocusChange(false);
    };

    document.addEventListener("mousedown", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, [onSearchFocusChange]);

  return (
    <Navbar
      className="z-50 bg-white/95 backdrop-blur border-b border-default-200"
      classNames={{
        wrapper: "max-w-7xl",
      }}
    >
      <p className="font-extrabold tracking-tight text-primary">Serona</p>
      <NavbarContent justify="start" className="flex-1 max-w-xl">
        <div
          ref={searchWrapperRef}
          className="
            relative
            w-50
            transition-all
            duration-300
            ease-in-out
            focus-within:w-full
            "
        >
          <Input
            ref={inputRef}
            autoComplete="off"
            value={searchText}
            onValueChange={setSearchText}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown" && isDropdownOpen) {
                e.preventDefault();
                setHighlightedIndex((prev) => (prev + 1) % totalOptions);
                return;
              }

              if (e.key === "ArrowUp" && isDropdownOpen) {
                e.preventDefault();
                setHighlightedIndex(
                  (prev) => (prev - 1 + totalOptions) % totalOptions,
                );
                return;
              }

              if (e.key === "Escape") {
                setIsFocused(false);
                onSearchFocusChange(false);
                inputRef.current?.blur();
                return;
              }

              if (e.key === "Enter") {
                e.preventDefault();
                handleSearchSubmit();
              }
            }}
            onFocus={() => {
              setIsFocused(true);
              onSearchFocusChange(true);
            }}
            onBlur={(e) => {
              const relatedTarget = e.relatedTarget as Node | null;
              if (
                relatedTarget &&
                searchWrapperRef.current?.contains(relatedTarget)
              ) {
                return;
              }
              setIsFocused(false);
              onSearchFocusChange(false);
            }}
            classNames={{
              base: "h-10",
              mainWrapper: "h-full",
              input: "text-sm",
              inputWrapper: `
                h-full 
                rounded-full 
                bg-default-100
                px-4
                transition-all 
                duration-300
                ${isFocused ? "ring-2 ring-primary/40 shadow-md bg-white" : ""}
                `,
            }}
            placeholder="Search..."
            size="sm"
            startContent={<SearchIcon size={18} className="text-gray-500" />}
            type="search"
          />

          {isDropdownOpen && (
            <div className="absolute top-12 left-0 right-0 z-[60] rounded-xl border border-default-200 bg-white shadow-lg overflow-hidden">
              {users.length > 0 && (
                <div className="max-h-96 overflow-y-auto">
                  {users.map((searchUser, idx) => (
                    <button
                      key={searchUser.clerk_id}
                      type="button"
                      className={`w-full px-4 py-3 text-left flex items-center gap-3 ${
                        highlightedIndex === idx ? "bg-default-100" : "bg-white"
                      }`}
                      onMouseEnter={() => setHighlightedIndex(idx)}
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => {
                        router.push(`/u/${searchUser.clerk_id}`);
                        setIsFocused(false);
                        onSearchFocusChange(false);
                        inputRef.current?.blur();
                      }}
                    >
                      <Avatar
                        radius="full"
                        size="sm"
                        src={searchUser.avatar ?? undefined}
                        name={searchUser.name}
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {searchUser.name}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {searchUser.specialization || "Doctor"}
                          {searchUser.hospital
                            ? ` · ${searchUser.hospital}`
                            : ""}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {isLoading && users.length === 0 && (
                <div className="px-4 py-3 text-sm text-gray-500">
                  Searching...
                </div>
              )}

              <button
                type="button"
                className={`w-full border-t border-default-200 px-4 py-3 text-center text-base font-semibold text-blue-700 ${
                  highlightedIndex === users.length
                    ? "bg-default-100"
                    : "bg-white"
                }`}
                onMouseEnter={() => setHighlightedIndex(users.length)}
                onMouseDown={(event) => event.preventDefault()}
                onClick={navigateToAllResults}
              >
                See all results
              </button>
            </div>
          )}
        </div>
      </NavbarContent>

      {/* RIGHT SECTION */}
      <NavbarContent justify="end" className="gap-6">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Tooltip content={item.label} key={item.href}>
              <NavbarItem>
                <Link
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors duration-200 ${
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-gray-600 hover:bg-default-100 hover:text-gray-900"
                  }`}
                >
                  <Icon size={22} />
                </Link>
              </NavbarItem>
            </Tooltip>
          );
        })}
        <NavbarItem>
          <Dropdown placement="bottom-end">
            <DropdownTrigger>
              <Avatar
                showFallback
                name={profile?.identity?.name || "User"}
                size="sm"
                src={profile?.identity?.avatar || undefined}
              />
            </DropdownTrigger>
            <DropdownMenu aria-label="Profile Actions" variant="flat">
              <DropdownItem key="profile" className="h-14 gap-2">
                <p className="font-semibold">Signed in as</p>
                <p className="font-semibold">
                  {profile?.identity?.name || "User"}
                </p>
              </DropdownItem>
              <DropdownItem
                key="my_profile"
                onPress={() => {
                  if (profile?.identity?.clerk_id) {
                    router.push(`/u/${profile.identity.clerk_id}`);
                  }
                }}
              >
                My profile
              </DropdownItem>
              <DropdownItem key="help_and_feedback">
                Help & Feedback
              </DropdownItem>
              <DropdownItem
                key="logout"
                color="danger"
                onPress={async () => {
                  await signOut();
                  router.push("/signin");
                }}
              >
                Log Out
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </NavbarItem>
      </NavbarContent>
    </Navbar>
  );
};

export default AppNavbar;
