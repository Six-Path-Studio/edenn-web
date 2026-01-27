"use client";

import { useState, useEffect } from "react";
import { Bell, MessageSquare, Search, ChevronDown } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import Container from "@/components/ui/Container";
import LogoutModal from "@/components/ui/LogoutModal";
import { usePathname, useRouter } from "next/navigation";
import UploadIcon from "@/components/icons/UploadIcon";
import UpvoteNotificationIcon from "@/components/icons/UpvoteNotificationIcon";

import { useAuth } from "@/components/providers/AuthProvider";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

interface NavbarProps {
  isLoggedIn?: boolean;
}

export default function Navbar({ isLoggedIn = false }: NavbarProps) {
  const pathname = usePathname();
  const { user, isAuthenticated, signOut } = useAuth();
  const [activeDropdown, setActiveDropdown] = useState<"home" | "user" | "notifications" | null>(null);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll for glassmorphism
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fetch user data from Convex
  const dbUser = useQuery(
    api.users.getUserByEmail,
    user?.email ? { email: user.email } : "skip"
  );

  const displayName = dbUser?.name || user?.name || "User";

  // Auto-logout if user exists locally but not in DB (stale session)
  useEffect(() => {
    if (user && dbUser === null) {
      console.warn("User not found in DB, signing out...");
      signOut();
    }
  }, [user, dbUser, signOut]);

  // Real notifications
  const activeNotifications = useQuery(api.notifications.getNotifications, user?.id ? { userId: user.id } : "skip") || [];
  const unreadMessageCount = useQuery(api.notifications.getUnreadMessageCount, user?.id ? { userId: user.id } : "skip") || 0;
  const unreadNotificationCount = useQuery(api.notifications.getUnreadNotificationCount, user?.id ? { userId: user.id } : "skip") || 0;
  const markNotificationsAsRead = useMutation(api.notifications.markNotificationsAsRead);

  // Helper to validate image URLs
  const getValidImageUrl = (url: string | undefined, fallback: string): string => {
    if (!url || url.trim() === "" || url === "undefined") return fallback;
    if (url.startsWith("/") || url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }
    return fallback;
  };

  const avatarUrl = getValidImageUrl(dbUser?.avatar || user?.avatar, "/images/avatar.png");

  const toggleDropdown = (name: "home" | "user" | "notifications") => {
    setActiveDropdown(prev => prev === name ? null : name);
    if (isMobileMenuOpen) setIsMobileMenuOpen(false);
  };

  // Scroll lock removed for floating menu style

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.dropdown-trigger') && !target.closest('.mobile-menu') && !target.closest('.mobile-menu-toggle')) {
        setActiveDropdown(null);
        setIsMobileMenuOpen(false);
      }
    };

    if (activeDropdown || isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeDropdown, isMobileMenuOpen]);



  // Helper for active class
  const getLinkClass = (path: string) => {
    return pathname === path
      ? "text-white font-medium text-sm transition-colors"
      : "text-text-secondary hover:text-white transition-colors text-sm font-medium";
  };

  const mobileLinkClass = (path: string) => {
    return pathname === path
      ? "text-white text-lg font-bold"
      : "text-text-secondary hover:text-white text-lg font-bold transition-colors";
  };

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 flex justify-center pt-6 px-4 pointer-events-none transition-all duration-300 ${scrolled ? 'pt-2' : 'pt-6'}`}>
      <Container className={`flex items-center justify-between py-4 relative pointer-events-auto z-101 transition-all duration-300 rounded-[32px] ${scrolled
        ? 'bg-black/40 backdrop-blur-md border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] px-6'
        : 'bg-transparent border-transparent px-4'
        }`}>
        {/* Logo */}
        <div className="flex items-center gap-2 cursor-pointer relative z-102">
          <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>
            <svg width="155" height="37" viewBox="0 0 155 37" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-8 w-auto">
              <path d="M62.4714 11.4967C67.7634 11.4967 72.0535 15.7867 72.0535 21.0787C72.0535 21.6687 71.9974 22.2457 71.8953 22.8062H68.6755V22.8053H59.1726V19.6637H68.7537C68.1086 16.7877 65.542 14.6383 62.4714 14.6383C58.9145 14.6383 56.031 17.5218 56.031 21.0787C56.031 24.6356 58.9145 27.5191 62.4714 27.5191C64.8667 27.5191 66.9546 26.2104 68.0642 24.2701L70.8396 25.7447C69.2011 28.6769 66.069 30.6607 62.4714 30.6607C57.1794 30.6607 52.8894 26.3707 52.8894 21.0787C52.8894 15.7867 57.1794 11.4967 62.4714 11.4967Z" fill="white" />
              <path d="M103.939 11.4967C109.231 11.4967 113.521 15.7867 113.521 21.0787C113.521 21.6687 113.465 22.2457 113.363 22.8062H110.143V22.8053H100.643V19.6637H110.221C109.576 16.7877 107.01 14.6383 103.939 14.6383C100.382 14.6383 97.4987 17.5218 97.4987 21.0787C97.4987 24.6356 100.382 27.5191 103.939 27.5191C106.334 27.5191 108.422 26.2104 109.532 24.2701L112.307 25.7447C110.669 28.6769 107.537 30.6607 103.939 30.6607C98.6471 30.6607 94.3571 26.3707 94.3571 21.0787C94.3571 15.7867 98.6471 11.4967 103.939 11.4967Z" fill="white" />
              <path d="M118.238 13.9823C119.939 12.4385 122.198 11.4979 124.676 11.4979C129.915 11.498 134.17 15.7028 134.254 20.9218H134.264V30.6601H131.122V20.9218H131.112C131.028 17.438 128.18 14.6396 124.676 14.6395C121.156 14.6395 118.298 17.463 118.238 20.9686V21.1913C118.24 21.2533 118.24 21.3153 118.243 21.3769V28.1776C118.242 28.1761 118.24 28.1743 118.238 28.1727V30.6601H115.097V21.1923C115.096 21.1549 115.094 21.1175 115.094 21.08C115.094 21.0419 115.096 21.0037 115.097 20.9657V11.496H118.238V13.9823Z" fill="white" />
              <path d="M92.7933 21.0413C92.7934 21.0539 92.7943 21.0669 92.7943 21.0794C92.7943 21.0918 92.7934 21.1042 92.7933 21.1165V30.6595H89.6517V28.1741C87.9504 29.7191 85.6914 30.6614 83.2123 30.6614C77.9205 30.6614 73.6305 26.3712 73.6302 21.0794C73.6303 15.7875 77.9203 11.4974 83.2123 11.4974C85.6914 11.4974 87.9504 12.4387 89.6517 13.9837V5.84016H92.7933V21.0413ZM83.2123 14.639C82.4341 14.639 81.688 14.7767 80.9974 15.0296C80.8004 15.1018 80.6078 15.1834 80.4203 15.2738C79.1062 15.9069 78.0397 16.9733 77.4066 18.2874C77.3163 18.4748 77.2346 18.6676 77.1625 18.8646C76.9097 19.555 76.7719 20.3014 76.7719 21.0794C76.7719 21.3424 76.7891 21.602 76.8197 21.8568C76.827 21.9171 76.8342 21.9776 76.8431 22.0374C76.8503 22.0854 76.8593 22.1334 76.8676 22.181C76.8769 22.2353 76.8851 22.2902 76.8959 22.3441C76.9051 22.3905 76.9169 22.4367 76.9271 22.4827C76.9395 22.5385 76.9523 22.5945 76.9662 22.6497C76.9694 22.6625 76.9717 22.676 76.975 22.6888L77.0336 22.8997C77.0375 22.913 77.0423 22.9265 77.0463 22.9398C77.0625 22.9937 77.0794 23.0476 77.097 23.1009C77.1104 23.1413 77.1239 23.182 77.1381 23.222C77.1581 23.2789 77.179 23.3358 77.2006 23.3919C77.216 23.4321 77.2322 23.4723 77.2484 23.512C77.2707 23.5667 77.294 23.6212 77.3177 23.6751C77.3328 23.7093 77.348 23.7438 77.3636 23.7777C77.392 23.8389 77.4214 23.9001 77.4515 23.9603C77.4648 23.9867 77.4789 24.0131 77.4926 24.0394C77.5216 24.0953 77.5508 24.1514 77.5814 24.2064C77.6055 24.2496 77.6306 24.2926 77.6556 24.3353C77.68 24.3767 77.7046 24.4184 77.7299 24.4593C77.7573 24.5037 77.7863 24.5475 77.8148 24.5911C77.8402 24.6301 77.8648 24.67 77.891 24.7083C77.9212 24.7526 77.9535 24.7958 77.9847 24.8392C78.0141 24.8799 78.0433 24.9212 78.0736 24.9613C78.095 24.9895 78.1172 25.0174 78.139 25.0452C78.2396 25.1737 78.3446 25.2989 78.4545 25.4193C78.5208 25.492 78.589 25.5635 78.6586 25.6331C78.7613 25.7358 78.8685 25.8344 78.9779 25.93C79.0183 25.9653 79.0587 26.0012 79.1 26.0355C79.1384 26.0674 79.178 26.0982 79.2172 26.1292C79.2544 26.1587 79.2916 26.1885 79.3295 26.2171C79.3686 26.2467 79.4088 26.2753 79.4486 26.304C79.493 26.3361 79.5372 26.3688 79.5824 26.3997C79.6189 26.4246 79.6567 26.4478 79.6937 26.472C79.7394 26.5018 79.785 26.5322 79.8314 26.5609C79.8716 26.5857 79.9128 26.6092 79.9535 26.6331C79.9969 26.6587 80.0403 26.6848 80.0844 26.7093C80.1394 26.7399 80.1954 26.7691 80.2513 26.7982C80.2776 26.8118 80.3039 26.8259 80.3304 26.8392C80.3907 26.8694 80.4517 26.8987 80.5131 26.9271C80.547 26.9428 80.5814 26.9579 80.6156 26.973C80.6695 26.9968 80.724 27.02 80.7787 27.0423C80.8185 27.0586 80.8586 27.0747 80.8988 27.0902C80.955 27.1118 81.0118 27.1326 81.0687 27.1527C81.1156 27.1692 81.1629 27.185 81.2103 27.2005C81.2496 27.2133 81.2889 27.2265 81.3285 27.2386C81.3966 27.2594 81.4655 27.2786 81.5345 27.2972C81.5677 27.3061 81.6008 27.3152 81.6342 27.3236C81.6917 27.3381 81.7498 27.3507 81.808 27.3636C81.8541 27.3739 81.9001 27.3856 81.9467 27.3948C82.0006 27.4056 82.0553 27.4138 82.1097 27.4232C82.1575 27.4314 82.2052 27.4404 82.2533 27.4476C82.3132 27.4565 82.3735 27.4637 82.434 27.471C82.4775 27.4763 82.521 27.4823 82.5648 27.4866C82.6696 27.4971 82.775 27.5057 82.8812 27.5111L83.2123 27.5198C83.4311 27.5198 83.6475 27.508 83.8607 27.4866C83.8904 27.4837 83.92 27.4793 83.9496 27.4759C84.0291 27.4668 84.1083 27.4576 84.1869 27.4456C84.2088 27.4423 84.2305 27.4375 84.2523 27.4339C84.3318 27.421 84.4111 27.4077 84.4896 27.3919C84.5279 27.3842 84.5659 27.3749 84.6039 27.3665C84.6726 27.3514 84.7411 27.336 84.809 27.3187C84.8351 27.312 84.8611 27.3042 84.8871 27.2972C84.9604 27.2775 85.0336 27.2579 85.1058 27.2357C85.1416 27.2247 85.1768 27.2121 85.2123 27.2005C85.2733 27.1806 85.3347 27.1616 85.3949 27.14C85.4388 27.1241 85.4823 27.1069 85.5258 27.0902C85.5794 27.0695 85.633 27.0487 85.6859 27.0267C85.7325 27.0073 85.7786 26.9866 85.8246 26.9661C85.869 26.9464 85.9135 26.9263 85.9574 26.9056C86.0053 26.883 86.0527 26.859 86.1 26.8353C86.1467 26.8118 86.1936 26.7885 86.2396 26.764C86.2872 26.7386 86.3344 26.7124 86.3812 26.6859C86.4219 26.6628 86.4622 26.6385 86.5023 26.6146C86.5503 26.586 86.5978 26.5564 86.6449 26.5267C86.6814 26.5037 86.7183 26.4811 86.7543 26.4573C86.801 26.4265 86.8471 26.3946 86.8929 26.3626C86.9321 26.3353 86.9716 26.3078 87.0101 26.2796C87.0547 26.247 87.0983 26.2127 87.142 26.179C87.1773 26.1517 87.2127 26.124 87.2474 26.096C87.2928 26.0595 87.3379 26.0224 87.3822 25.9847C87.414 25.9577 87.4457 25.9303 87.4769 25.9027C87.5171 25.8671 87.5568 25.8308 87.5961 25.7943C87.6382 25.7551 87.68 25.7154 87.7211 25.6751C87.7502 25.6465 87.7793 25.6174 87.808 25.5882C87.8476 25.5478 87.8866 25.5066 87.9252 25.4652C87.9565 25.4315 87.9883 25.3979 88.0189 25.3636C88.0576 25.3203 88.0957 25.2761 88.1332 25.2318C88.1618 25.1979 88.1903 25.1636 88.2181 25.1292C88.2503 25.0895 88.2816 25.0486 88.3129 25.0081C88.346 24.9652 88.3794 24.922 88.4115 24.8782C88.4376 24.8426 88.4633 24.8061 88.4886 24.7698C88.5214 24.7231 88.5538 24.6758 88.5853 24.6282C88.6131 24.5863 88.6406 24.5439 88.6674 24.5013C88.6949 24.4575 88.7219 24.413 88.7484 24.3685C88.7715 24.3297 88.7945 24.2906 88.8168 24.2513C88.8462 24.1995 88.8747 24.1468 88.9027 24.0941C88.9204 24.0608 88.9383 24.0271 88.9554 23.9935C88.9827 23.9399 89.0098 23.8858 89.0355 23.8314C89.0567 23.7866 89.0769 23.7409 89.097 23.6956C89.1182 23.6481 89.1395 23.6002 89.1595 23.5521C89.176 23.5124 89.1917 23.472 89.2074 23.432C89.2311 23.3715 89.2548 23.3106 89.2767 23.2493C89.2875 23.2192 89.2967 23.1879 89.307 23.1575C89.3283 23.0951 89.3501 23.0323 89.3695 22.9691C89.3849 22.9188 89.3983 22.8675 89.4125 22.8167C89.4265 22.7665 89.4416 22.7161 89.4545 22.6654C89.4666 22.6173 89.4776 22.5684 89.4886 22.5198C89.5007 22.4671 89.513 22.4139 89.5238 22.3607C89.5862 22.0515 89.6275 21.734 89.6439 21.4105L89.6517 21.1156V21.0423C89.6505 20.8364 89.6396 20.6329 89.6195 20.432C89.616 20.3971 89.6109 20.3621 89.6068 20.3275C89.5861 20.1499 89.5596 19.974 89.5248 19.8011C89.5126 19.7406 89.4986 19.6803 89.4847 19.6204C89.474 19.5742 89.4632 19.5276 89.4515 19.4818C89.4449 19.4557 89.437 19.4296 89.4301 19.4036C89.4104 19.3304 89.3907 19.257 89.3685 19.1849C89.3576 19.1493 89.3449 19.1138 89.3334 19.0784C89.3135 19.0175 89.2945 18.956 89.2728 18.8958C89.257 18.852 89.2397 18.8084 89.223 18.765C89.2024 18.7114 89.1816 18.6576 89.1595 18.6048C89.1402 18.5583 89.1194 18.5121 89.099 18.4661C89.0794 18.422 89.059 18.3779 89.0385 18.3343C89.0129 18.2802 88.9863 18.2264 88.9594 18.1732C88.9406 18.1361 88.9222 18.0985 88.9027 18.0618C88.8757 18.0109 88.8471 17.9605 88.8187 17.9105C88.7955 17.8695 88.7715 17.8288 88.7474 17.7884C88.7189 17.7405 88.6893 17.6929 88.6595 17.6458C88.6365 17.6094 88.6139 17.5724 88.5902 17.5364C88.5594 17.4898 88.5275 17.4436 88.4955 17.3978C88.4681 17.3586 88.4407 17.3191 88.4125 17.2806C88.3799 17.236 88.3456 17.1924 88.3119 17.1488C88.2846 17.1134 88.2569 17.078 88.2289 17.0433C88.1924 16.998 88.1553 16.9528 88.1176 16.9085C88.0905 16.8768 88.0631 16.845 88.0355 16.8138C88 16.7736 87.9636 16.7339 87.9271 16.6947C87.888 16.6526 87.8482 16.6107 87.808 16.5697C87.7793 16.5405 87.7503 16.5114 87.7211 16.4827C87.6807 16.4431 87.6394 16.4041 87.598 16.3656C87.5644 16.3342 87.5308 16.3024 87.4965 16.2718C87.4531 16.2332 87.409 16.195 87.3646 16.1575C87.3308 16.129 87.2965 16.1005 87.2621 16.0726C87.2223 16.0404 87.1815 16.0091 87.141 15.9779C87.098 15.9447 87.0549 15.9113 87.0111 15.8792C86.9754 15.8531 86.939 15.8275 86.9027 15.8021C86.856 15.7693 86.8087 15.7369 86.7611 15.7054C86.7237 15.6806 86.6858 15.6561 86.6478 15.6322C86.5995 15.6016 86.5505 15.5716 86.5013 15.5423C86.4674 15.5221 86.4331 15.5023 86.3988 15.4827C86.3421 15.4504 86.2847 15.4187 86.2269 15.388C86.196 15.3716 86.1644 15.3561 86.1332 15.3402C86.0771 15.3116 86.0212 15.2822 85.9642 15.2552C85.9265 15.2374 85.8881 15.2206 85.85 15.2034C85.7883 15.1757 85.7262 15.1482 85.6635 15.1224C85.6505 15.1171 85.6373 15.112 85.6244 15.1068C85.5441 15.0743 85.463 15.0433 85.3812 15.014C85.3512 15.0033 85.3206 14.994 85.2904 14.9837C85.2279 14.9624 85.1653 14.9406 85.1019 14.9212C85.0516 14.9058 85.0004 14.8925 84.9496 14.8782C84.907 14.8663 84.8646 14.8532 84.8217 14.8421L84.7826 14.8323C84.7396 14.8216 84.6961 14.812 84.6527 14.8021C84.5998 14.79 84.5469 14.7777 84.4935 14.7669C84.435 14.7551 84.3759 14.7449 84.3168 14.7347C84.2719 14.7269 84.2272 14.7181 84.182 14.7113C84.1144 14.701 84.0462 14.6939 83.9779 14.6859C83.9405 14.6814 83.9032 14.675 83.8656 14.6712C83.759 14.6605 83.6514 14.6533 83.5433 14.6478L83.2123 14.639Z" fill="white" />
              <path d="M138.973 13.9882C140.675 12.4408 142.936 11.498 145.418 11.4979C150.71 11.4979 155 15.7881 155 21.08C155 21.1537 154.995 21.2273 154.994 21.3007V30.6601H151.852V20.9218H151.854C151.77 17.4381 148.922 14.6396 145.418 14.6395C141.914 14.6398 139.065 17.4382 138.981 20.9218H138.973V30.6601H135.832V11.496H138.973V13.9882Z" fill="white" />
              <path d="M18.0713 0C23.2783 0.000175603 27.4998 4.07463 27.5 9.10059C27.5 9.19687 27.4943 9.2931 27.4912 9.38867C28.2471 9.20016 29.0405 9.10059 29.8574 9.10059C35.0644 9.10084 39.2859 13.1753 39.2861 18.2012C39.2861 23.2273 35.0645 27.3015 29.8574 27.3018C28.086 27.3018 26.4286 26.8299 25.0127 26.0098C24.1374 31.8861 18.9016 36.4023 12.5713 36.4023C5.62833 36.4022 0 30.9691 0 24.2676C0.000305554 18.6447 3.96307 13.9157 9.33984 12.5391C8.89098 11.4782 8.64258 10.3173 8.64258 9.10059C8.64281 4.07452 12.8641 0 18.0713 0ZM18.3213 6.46582C15.1074 6.6231 12.5521 9.18797 12.5518 12.3291C12.5518 13.0386 12.682 13.7191 12.9209 14.3486C12.9462 14.4153 12.9733 14.4814 13.001 14.5469C9.53079 15.4342 6.97285 18.4857 6.97266 22.1143C6.97266 26.4378 10.6038 29.9432 15.083 29.9434C19.1673 29.9434 22.545 27.0288 23.1094 23.2373C24.0234 23.7674 25.0933 24.0723 26.2373 24.0723C29.5969 24.0723 32.3203 21.4439 32.3203 18.2012C32.3201 14.9586 29.5968 12.3301 26.2373 12.3301C25.7109 12.3301 25.2 12.3943 24.7129 12.5156C24.7149 12.4539 24.7178 12.3913 24.7178 12.3291C24.7175 9.18792 22.1612 6.62301 18.9473 6.46582C18.8438 6.46076 18.7396 6.45801 18.6348 6.45801C18.5298 6.45801 18.425 6.46075 18.3213 6.46582Z" fill="white" />
              <rect x="45.5325" y="4" width="0.919853" height="28.5154" rx="0.459927" fill="#6A6A6A" />
            </svg>
          </Link>
        </div>

        {/* Center: Nav Links + Search */}
        <div className="hidden md:flex items-center gap-6">
          <div className="relative dropdown-trigger">
            
            <button
              className={`flex flex-row items-center gap-1 text-sm font-power font-normal transition-colors ${pathname === '/' ? 'text-accent' : 'text-text-secondary'}`}
            >
              <Link href={'/'}>
                Home
              </Link>
              <ChevronDown onClick={() => toggleDropdown("home")}
                className={`w-4 h-4 transition-transform ${activeDropdown === 'home' ? 'rotate-180' : ''}`} />
            </button>

            {/* Home Dropdown */}
            {activeDropdown === "home" && (
              <div className="absolute top-full left-0 mt-4 w-[180px] bg-[#111111] border border-[#222] rounded-[24px] p-2 flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                <Link href="#" className="text-white/80 hover:text-white hover:bg-white/5 px-4 py-3 rounded-[16px] text-sm font-medium transition-colors">
                  Company
                </Link>
                <Link href="#" className="text-white/80 hover:text-white hover:bg-white/5 px-4 py-3 rounded-[16px] text-sm font-medium transition-colors">
                  Blog
                </Link>
                <Link href="/contact" className="text-white/80 hover:text-white hover:bg-white/5 px-4 py-3 rounded-[16px] text-sm font-medium transition-colors">
                  Contact Us
                </Link>
              </div>
            )}
          </div>

          <Link href="/studios" className={pathname === "/studios" ? "text-accent font-power font-normal text-sm transition-colors" : "text-text-secondary hover:text-white transition-colors text-sm font-power font-normal"}>
            Studios
          </Link>
          <Link href="/games" className={pathname === "/games" ? "text-accent font-power font-normal text-sm transition-colors" : "text-text-secondary hover:text-white transition-colors text-sm font-power font-normal"}>
            Games
          </Link>
          <Link href="/creators" className={pathname === "/creators" ? "text-accent font-power font-normal text-sm transition-colors" : "text-text-secondary hover:text-white transition-colors text-sm font-power font-normal"}>
            Creators
          </Link>

          {/* Search Pill - Smaller */}
          <div className="flex items-center gap-2 bg-[#1A1A1A] border border-[#3c3c3c] rounded-full px-3 py-1.5 w-36 text-text-secondary">
            <Search className="w-4 h-4" />
            <input
              type="text"
              placeholder="Search"
              className="bg-transparent border-none outline-none text-sm w-full placeholder:text-text-secondary text-white"
            />
          </div>
        </div>

        {/* Right Side Desktop */}
        <div className="hidden md:flex items-center gap-4">
          {(isLoggedIn || isAuthenticated) ? (
            <>
              {/* Icons */}
              <div className="flex items-center gap-2">
                <div className="relative dropdown-trigger">
                  <button
                    onClick={() => toggleDropdown("notifications")}
                    className={`p-2 rounded-full border border-[#3c3c3c] bg-[#171717] hover:bg-white/10 transition-colors ${activeDropdown === "notifications" ? "text-white border-white" : "text-white"} relative`}
                  >
                    <Bell className="w-5 h-5" />
                    {unreadNotificationCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full border border-[#171717]">
                        {unreadNotificationCount > 9 ? "9+" : unreadNotificationCount}
                      </span>
                    )}
                  </button>

                  {/* Notification Dropdown */}
                  {activeDropdown === "notifications" && (
                    <div className="absolute top-full right-0 sm:right-auto sm:left-1/2 sm:-translate-x-1/2 mt-4 w-[380px] bg-[#0A0A0A] border border-[#222] rounded-[24px] p-0 flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-200 z-[100] overflow-hidden">
                      {/* Header */}
                      <div className="flex items-center justify-between px-6 py-5 border-b border-[#222]">
                        <span className="text-white text-lg font-dm-sans">Notification</span>
                        <button
                          onClick={async () => {
                            if (user?.id) {
                              await markNotificationsAsRead({});
                            }
                          }}
                          className="text-[#7628DB] text-sm hover:text-white transition-colors font-medium"
                        >
                          Mark as read
                        </button>
                      </div>

                      {/* List */}
                      <div className="flex flex-col gap-2 p-4 max-h-[400px] overflow-y-auto custom-scrollbar">
                        {activeNotifications.length === 0 ? (
                          <div className="px-6 py-8 text-center text-gray-500 text-sm font-dm-sans">No new notifications</div>
                        ) : (
                          activeNotifications.map((notif: any, i: number) => (
                            <div key={i} className="flex gap-4 p-4 bg-[#161618] hover:bg-[#1E1E20] transition-colors rounded-2xl cursor-pointer group">
                              {/* Icon */}
                              <div className="shrink-0 mt-1">
                                {(notif.type === 'upvote' || notif.type === 'upvote_profile') && (
                                  <UpvoteNotificationIcon className="w-5 h-5" />
                                )}
                                {notif.type === 'upload' && (
                                  <UploadIcon className="w-5 h-5" />
                                )}
                                {notif.type === 'follow' && (
                                  <div className="w-5 h-5 text-[#3B82F6] bg-[#3B82F6]/10 p-1 rounded-full flex items-center justify-center">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><line x1="20" y1="8" x2="20" y2="14" /><line x1="23" y1="11" x2="17" y2="11" /></svg>
                                  </div>
                                )}
                                {!['upvote', 'upvote_profile', 'upload', 'follow'].includes(notif.type) && (
                                  <div className="w-5 h-5 text-gray-400"><Bell className="w-full h-full" /></div>
                                )}
                              </div>

                              {/* Content */}
                              <div className="flex flex-col gap-1.5 min-w-0">
                                <p className="text-[#888] text-sm leading-snug font-dm-sans">
                                  {(notif.type === 'upvote' || notif.type === 'upvote_profile') && (
                                    <>
                                      <span className="text-white font-semibold">{notif.sender?.name || "Someone"}</span> just sent you an upvote
                                    </>
                                  )}
                                  {notif.type === 'upload' && (
                                    <>
                                      Your <span className="text-white font-semibold">Game</span> has been uploaded successfully
                                    </>
                                  )}
                                  {notif.type === 'follow' && (
                                    <>
                                      <span className="text-white font-semibold">{notif.sender?.name || "Someone"}</span> started following you
                                    </>
                                  )}
                                  {!['upvote', 'upvote_profile', 'upload', 'follow'].includes(notif.type) && (
                                    <span>New notification</span>
                                  )}
                                </p>
                                <span className="text-[#555] text-xs font-dm-sans">
                                  {new Date(notif.createdAt).toLocaleDateString([], { month: '2-digit', day: '2-digit', year: '2-digit' })}, {new Date(notif.createdAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                                </span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <Link href="/messages" className="p-2 rounded-full border border-[#3c3c3c] bg-[#171717] text-white hover:bg-white/10 transition-colors relative">
                  <MessageSquare className="w-5 h-5" />
                  {unreadMessageCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full border border-[#171717]">
                      {unreadMessageCount > 9 ? "9+" : unreadMessageCount}
                    </span>
                  )}
                </Link>
              </div>

              {/* Separator */}
              <div className="h-8 w-px bg-[#3c3c3c] mx-1 hidden sm:block"></div>

              {/* User Profile */}
              <div className="relative dropdown-trigger">
                <div
                  className="hidden sm:flex items-center gap-3 cursor-pointer"
                  onClick={() => toggleDropdown("user")}
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden border border-white/20 relative">
                    <Image
                      src={avatarUrl}
                      alt="User"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-medium text-white truncate max-w-[100px]" title={displayName}>{displayName}</span>
                    <ChevronDown className={`w-4 h-4 text-text-secondary transition-transform ${activeDropdown === 'user' ? 'rotate-180' : ''}`} />
                  </div>
                </div>

                {/* User Dropdown */}
                {activeDropdown === "user" && (
                  <div className="absolute top-full right-0 mt-4 w-[200px] bg-[#111111] border border-[#222] rounded-[24px] p-2 flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                    {dbUser?.role?.toLowerCase() === "studio" && (
                      <Link href="/upload-game" className="text-white/80 hover:text-white hover:bg-white/5 px-4 py-3 rounded-[16px] text-sm font-medium transition-colors">
                        Upload
                      </Link>
                    )}
                    <Link href="/profile" className="text-white/80 hover:text-white hover:bg-white/5 px-4 py-3 rounded-[16px] text-sm font-medium transition-colors">
                      Profile
                    </Link>
                    <Link href="/settings" className="text-white/80 hover:text-white hover:bg-white/5 px-4 py-3 rounded-[16px] text-sm font-medium transition-colors">
                      Settings
                    </Link>
                    <button
                      onClick={() => setIsLogoutModalOpen(true)}
                      className="text-white/80 hover:text-white hover:bg-white/5 px-4 py-3 rounded-[16px] text-sm font-medium transition-colors text-left w-full"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              {/* Sign In Link */}
              <Link href="/signin" className="text-white text-sm font-power hover:text-white/80 transition-colors">
                Sign in
              </Link>

              {/* Get Started Button */}
              <Link href="/onboarding" className="w-[148px] h-[54px] flex items-center justify-center bg-primary hover:bg-primary/90 active:scale-95 text-white font-power font-medium text-sm rounded-[60px] py-[3px] px-[6px] transition-all duration-300 ease-out">
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <div className="flex items-center gap-4 md:hidden relative z-102">
          {(isLoggedIn || isAuthenticated) && (
            <div className="flex items-center gap-2">
              <Link href="/messages" className="p-2 text-white relative">
                <MessageSquare className="w-5 h-5" />
                {unreadMessageCount > 0 && (
                  <span className="absolute top-0 right-0 bg-red-500 text-white text-[8px] font-bold w-3 h-3 flex items-center justify-center rounded-full">
                    {unreadMessageCount}
                  </span>
                )}
              </Link>
              <div className="relative dropdown-trigger">
                <button
                  onClick={() => toggleDropdown("notifications")}
                  className="p-2 text-white relative"
                >
                  <Bell className="w-5 h-5" />
                  {unreadNotificationCount > 0 && (
                    <span className="absolute top-0 right-0 bg-red-500 text-white text-[8px] font-bold w-3 h-3 flex items-center justify-center rounded-full">
                      {unreadNotificationCount}
                    </span>
                  )}
                </button>
                {/* Mobile Notification Dropdown */}
                {activeDropdown === "notifications" && (
                  <div className="absolute top-full right-0 mt-4 w-[280px] xs:w-[320px] bg-[#0A0A0A] border border-[#222] rounded-[24px] overflow-hidden shadow-2xl z-200 animate-in fade-in zoom-in-95 duration-200">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-[#222]">
                      <span className="text-white text-base font-dm-sans">Notifications</span>
                      <button
                        onClick={async () => {
                          if (user?.id) {
                            await markNotificationsAsRead({});
                          }
                        }}
                        className="text-[#7628DB] text-xs hover:text-white transition-colors font-medium"
                      >
                        Mark all read
                      </button>
                    </div>
                    <div className="flex flex-col gap-2 p-3 max-h-[300px] overflow-y-auto custom-scrollbar">
                      {activeNotifications.length === 0 ? (
                        <div className="px-6 py-8 text-center text-gray-500 text-sm font-dm-sans">No new notifications</div>
                      ) : (
                        activeNotifications.map((notif: any, i: number) => (
                          <div key={i} className="flex gap-3 p-3 bg-[#161618] hover:bg-[#1E1E20] transition-colors rounded-xl cursor-pointer text-left group">
                            <div className="shrink-0 mt-0.5">
                              {(notif.type === 'upvote' || notif.type === 'upvote_profile') && (
                                <UpvoteNotificationIcon className="w-4 h-4" />
                              )}
                              {notif.type === 'upload' && (
                                <UploadIcon className="w-4 h-4" />
                              )}
                              {notif.type === 'follow' && (
                                <div className="w-4 h-4 text-[#3B82F6] bg-[#3B82F6]/10 p-0.5 rounded-full flex items-center justify-center">
                                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><line x1="20" y1="8" x2="20" y2="14" /><line x1="23" y1="11" x2="17" y2="11" /></svg>
                                </div>
                              )}
                              {!['upvote', 'upvote_profile', 'upload', 'follow'].includes(notif.type) && (
                                <div className="w-4 h-4 text-gray-400"><Bell className="w-full h-full" /></div>
                              )}
                            </div>
                            <div className="flex flex-col gap-1 min-w-0">
                              <p className="text-[#888] text-[13px] leading-snug line-clamp-2 font-dm-sans">
                                {(notif.type === 'upvote' || notif.type === 'upvote_profile') && (
                                  <>
                                    <span className="text-white font-semibold">{notif.sender?.name || "Someone"}</span> just sent you an upvote
                                  </>
                                )}
                                {notif.type === 'upload' && (
                                  <>
                                    Your <span className="text-white font-semibold">Game</span> uploaded successfully
                                  </>
                                )}
                                {notif.type === 'follow' && (
                                  <>
                                    <span className="text-white font-semibold">{notif.sender?.name || "Someone"}</span> followed you
                                  </>
                                )}
                                {!['upvote', 'upvote_profile', 'upload', 'follow'].includes(notif.type) && (
                                  <span>New notification</span>
                                )}
                              </p>
                              <span className="text-[#555] text-[10px] font-dm-sans">{new Date(notif.createdAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile Avatar Dropdown */}
              <div className="relative dropdown-trigger">
                <button
                  onClick={() => toggleDropdown("user")}
                  className="relative w-8 h-8 rounded-full overflow-hidden border border-white/20 ml-1 block"
                >
                  <Image
                    src={avatarUrl}
                    alt="User"
                    fill
                    className="object-cover"
                  />
                </button>
                {activeDropdown === "user" && (
                  <div className="absolute top-full right-0 mt-4 w-[200px] bg-[#111111] border border-[#222] rounded-[24px] p-2 flex flex-col shadow-2xl z-200 animate-in fade-in zoom-in-95 duration-200">
                    {dbUser?.role?.toLowerCase() === "studio" && (
                      <Link href="/upload-game" onClick={() => setActiveDropdown(null)} className="text-white/80 hover:text-white hover:bg-white/5 px-4 py-3 rounded-[16px] text-sm font-medium transition-colors">
                        Upload
                      </Link>
                    )}
                    <Link href="/profile" onClick={() => setActiveDropdown(null)} className="text-white/80 hover:text-white hover:bg-white/5 px-4 py-3 rounded-[16px] text-sm font-medium transition-colors">
                      Profile
                    </Link>
                    <Link href="/settings" onClick={() => setActiveDropdown(null)} className="text-white/80 hover:text-white hover:bg-white/5 px-4 py-3 rounded-[16px] text-sm font-medium transition-colors">
                      Settings
                    </Link>
                    <button
                      onClick={() => {
                        setActiveDropdown(null);
                        setIsLogoutModalOpen(true);
                      }}
                      className="text-white/80 hover:text-white hover:bg-white/5 px-4 py-3 rounded-[16px] text-sm font-medium transition-colors text-left w-full"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
          <button
            onClick={() => {
              setIsMobileMenuOpen(!isMobileMenuOpen);
              setActiveDropdown(null);
            }}
            className="text-white p-2 mobile-menu-toggle"
          >
            {isMobileMenuOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12" /><line x1="4" x2="20" y1="6" y2="6" /><line x1="4" x2="20" y1="18" y2="18" /></svg>
            )}
          </button>
        </div>

      </Container>

      {/* Mobile Menu - Floating Purplish Glassmorphism */}
      <div
        className={`fixed top-[100px] left-4 right-4 z-40 transition-all duration-300 ease-out md:hidden flex flex-col p-6 rounded-[32px] border border-purple-500/20 bg-[#0f0a1ac0] backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.5),0_0_20px_rgba(118,40,219,0.15)] mobile-menu ${isMobileMenuOpen
          ? 'opacity-100 translate-y-0 pointer-events-auto'
          : 'opacity-0 -translate-y-4 pointer-events-none'
          }`}
      >
        <div className="flex flex-col gap-5">
          <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className={mobileLinkClass("/")}>
            Home
          </Link>
          <Link href="/studios" onClick={() => setIsMobileMenuOpen(false)} className={mobileLinkClass("/studios")}>
            Studios
          </Link>
          <Link href="/games" onClick={() => setIsMobileMenuOpen(false)} className={mobileLinkClass("/games")}>
            Games
          </Link>
          <Link href="/creators" onClick={() => setIsMobileMenuOpen(false)} className={mobileLinkClass("/creators")}>
            Creators
          </Link>

          <div className="h-px bg-[#222] w-full my-2"></div>

          <Link href="#" onClick={() => setIsMobileMenuOpen(false)} className="text-[#a1a1aa] text-lg font-medium">
            Company
          </Link>
          <Link href="#" onClick={() => setIsMobileMenuOpen(false)} className="text-[#a1a1aa] text-lg font-medium">
            Blog
          </Link>
          <Link href="/contact" onClick={() => setIsMobileMenuOpen(false)} className="text-[#a1a1aa] text-lg font-medium">
            Contact Us
          </Link>

          <div className="h-px bg-[#222] w-full my-2"></div>

          {(isLoggedIn || isAuthenticated) ? (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full overflow-hidden border border-white/20 relative">
                  <Image
                    src={avatarUrl}
                    alt="User"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-white font-medium">{displayName}</span>
                  <span className="text-white/50 text-xs">{user?.email}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <Link href="/signin" onClick={() => setIsMobileMenuOpen(false)} className="text-white text-lg font-medium">
                Sign In
              </Link>
              <Link href="/onboarding" onClick={() => setIsMobileMenuOpen(false)} className="bg-primary text-white text-center py-3 rounded-full font-medium">
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>

      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={() => {
          setIsLogoutModalOpen(false);
          signOut();
          // Use window.location.href for a full fresh state reset on home page
          window.location.href = "/";
        }}
      />
    </div>
  );
}
