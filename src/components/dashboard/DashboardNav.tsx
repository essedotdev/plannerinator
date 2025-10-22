import Link from "next/link";
import { getSession } from "@/lib/auth";
import { hasPermission, type Permission } from "@/lib/permissions";
import {
  LayoutDashboard,
  CheckSquare,
  Calendar,
  FileText,
  FolderKanban,
  Users,
  UserCircle,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  permission?: Permission;
}

const navItems: NavItem[] = [
  {
    label: "Overview",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Tasks",
    href: "/dashboard/tasks",
    icon: CheckSquare,
  },
  {
    label: "Events",
    href: "/dashboard/events",
    icon: Calendar,
  },
  {
    label: "Notes",
    href: "/dashboard/notes",
    icon: FileText,
  },
  {
    label: "Projects",
    href: "/dashboard/projects",
    icon: FolderKanban,
  },
  {
    label: "Profile",
    href: "/dashboard/profile",
    icon: UserCircle,
  },
  {
    label: "Users",
    href: "/dashboard/users",
    icon: Users,
    permission: "manage_users",
  },
];

export async function DashboardNav() {
  const session = await getSession();

  // Filtra nav items in base ai permessi
  const visibleItems = navItems.filter((item) => {
    if (!item.permission) return true;
    if (!session?.user) return false;
    return hasPermission(session.user.role, item.permission);
  });

  return (
    <nav className="space-y-1">
      {visibleItems.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-muted transition-colors"
          >
            <Icon className="h-5 w-5" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
