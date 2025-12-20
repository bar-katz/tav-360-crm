

import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation, Navigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useAuth } from '@/contexts/AuthContext';
import {
  Menu,
  X,
  Home,
  Building2,
  Users,
  Calendar,
  Phone,
  Wrench,
  UserPlus,
  Briefcase,
  Target,
  MessageCircle,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const navigationConfig = [
  {
    name: 'דשבורד תיווך', href: createPageUrl('BrokerageDashboard'), icon: Building2, roles: ['admin', 'office_manager', 'agent'],
    children: [
        { name: 'נכסים - מגורים', href: createPageUrl('PropertyBrokerage') + '?category=מגורים', icon: Home, roles: ['admin', 'office_manager', 'agent'] },
        { name: 'נכסים - משרדים', href: createPageUrl('PropertyBrokerage') + '?category=משרדים', icon: Briefcase, roles: ['admin', 'office_manager', 'agent'] },
        { name: 'לקוחות - מגורים', href: createPageUrl('BuyersBrokerage') + '?category=מגורים', icon: Users, roles: ['admin', 'office_manager', 'agent'] },
        { name: 'לקוחות - משרדים', href: createPageUrl('BuyersBrokerage') + '?category=משרדים', icon: Users, roles: ['admin', 'office_manager', 'agent'] },
        { name: 'התאמות', href: createPageUrl('MatchesBrokerage'), icon: Target, roles: ['admin', 'office_manager', 'agent'] },
    ]
  },
  {
    name: 'דשבורד ניהול נכסים', href: createPageUrl('PropertyManagementDashboard'), icon: Briefcase, roles: ['admin', 'office_manager', 'property_manager'],
    children: [
        { name: 'בעלי נכסים', href: createPageUrl('PropertyOwnerManagement'), icon: Briefcase, roles: ['admin', 'office_manager', 'property_manager'] },
        { name: 'דיירים', href: createPageUrl('Tenants'), icon: UserPlus, roles: ['admin', 'office_manager', 'property_manager'] },
        { name: 'קריאות שירות', href: createPageUrl('ServiceCalls'), icon: Phone, roles: ['admin', 'office_manager', 'property_manager', 'agent'] }, // Agents can see service calls
        { name: 'ספקים', href: createPageUrl('Suppliers'), icon: Wrench, roles: ['admin', 'office_manager', 'property_manager'] },
    ]
  },
  {
    name: 'דשבורד פרויקטים', href: createPageUrl('ProjectsDashboard'), icon: Target, roles: ['admin', 'office_manager', 'project_manager'],
    children: [
        { name: 'פרויקטים', href: createPageUrl('Projects'), icon: Building2, roles: ['admin', 'office_manager', 'project_manager'] },
        { name: 'לידים לפרויקט', href: createPageUrl('ProjectLeads'), icon: Target, roles: ['admin', 'office_manager', 'project_manager'] },
        { name: 'לידים לדיוור', href: createPageUrl('MarketingLeads'), icon: MessageCircle, roles: ['admin', 'office_manager'] }, // Only managers
    ]
  },
  { name: 'פגישות', href: createPageUrl('Meetings'), icon: Calendar, roles: ['admin', 'office_manager', 'agent', 'project_manager', 'property_manager'] }, // Everyone can see meetings
];

export default function Layout({ children, currentPageName }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState({});
  const { user: currentUser, isLoading: authLoading } = useAuth();
  const [navigation, setNavigation] = useState([]);
  const location = useLocation();

  const isActivePath = useCallback((href) => {
    // This function checks if the current pathname matches the href's base path, ignoring query parameters.
    // The previous dashboard specific logic for '/' or '/Dashboard' is removed as per the outline.
    // The previous check including location.search is also removed, meaning active state is based on base path only.
    return location.pathname === href.split('?')[0];
  }, [location.pathname]);

  // isActiveParent now uses useCallback and preserves its original logic to correctly determine
  // if an item is active, whether it has children or not.
  const isActiveParent = useCallback((item) => {
    if (item.children && item.children.length > 0) {
      return item.children.some(child => isActivePath(child.href));
    }
    return isActivePath(item.href);
  }, [isActivePath]);

  useEffect(() => {
    if (!currentUser) return;

    // Determine user role, default to 'agent' if not specified
    const userRole = currentUser.app_role || 'agent';

    // Filter navigation based on user role
    const filteredNav = navigationConfig.filter(item =>
        !item.roles || item.roles.includes(userRole)
    ).map(item => {
        if (item.children) {
            const filteredChildren = item.children.filter(child =>
                !child.roles || child.roles.includes(userRole)
            );
            return {
                ...item,
                children: filteredChildren
            };
        }
        return item;
    }).filter(item => !item.children || item.children.length > 0); // Remove parent if it has children but all children were filtered out

    setNavigation(filteredNav);

    // Initialize expandedMenus: automatically expand parent menus if any of their children are currently active
    const initialExpanded = {};
    filteredNav.forEach(item => {
        // Only expand items that are actual parents (have children) and have an active child.
        if (item.children && item.children.length > 0 && item.children.some(child => isActivePath(child.href))) {
            initialExpanded[item.name] = true;
        }
    });
    setExpandedMenus(initialExpanded);
  }, [currentUser, isActivePath]);

  const toggleMenu = (menuName) => {
    setExpandedMenus(prev => ({ ...prev, [menuName]: !prev[menuName] }));
  };

  // New useEffect hook to automatically expand parent menus when a child route becomes active
  useEffect(() => {
    if (!currentUser || navigation.length === 0) {
      return;
    }

    // Find an active parent menu (which has children) that is not yet expanded.
    // This specifically targets parents that can be expanded, similar to initialExpanded logic.
    const activeParentWithChildren = navigation.find(item =>
        item.children && item.children.length > 0 && // Ensure it's a parent menu with children
        item.children.some(child => isActivePath(child.href)) // Check if any of its children are active
    );

    if (activeParentWithChildren && !expandedMenus[activeParentWithChildren.name]) {
        setExpandedMenus(prev => ({
            ...prev,
            [activeParentWithChildren.name]: true
        }));
    }
  }, [location.pathname, navigation, isActivePath, expandedMenus, currentUser]);

  // Allow login page to render without authentication
  if (location.pathname === '/login') {
    return <>{children}</>;
  }
  
  if (authLoading) {
    return (
        <div className="flex items-center justify-center h-screen">
            <div className="text-lg text-gray-700">טוען נתוני משתמש...</div>
        </div>
    );
  }

  if (!currentUser) {
    // Redirect to login instead of showing error
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50" style={{ direction: 'rtl' }}>
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? '' : 'pointer-events-none'}`}>
        <div className={`fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity ${sidebarOpen ? 'opacity-100' : 'opacity-0'}`}
             onClick={() => setSidebarOpen(false)} />

        <div className={`fixed top-0 right-0 bottom-0 flex flex-col w-80 bg-white shadow-xl transform transition-transform ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="flex items-center justify-between h-16 px-4 bg-blue-600">
            <h1 className="text-xl font-bold text-white">TAV 360 CRM</h1>
            <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(false)} className="text-white hover:text-blue-200">
              <X className="h-6 w-6" />
            </Button>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon;
              const hasChildren = item.children && item.children.length > 0;
              const isExpanded = expandedMenus[item.name];
              const isActive = isActiveParent(item); // Uses the useCallback version of isActiveParent

              return (
                <div key={item.name}>
                  <div className="flex items-center">
                    <Link
                      to={item.href}
                      className={`flex items-center flex-1 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                        isActive
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                      onClick={() => !hasChildren && setSidebarOpen(false)}
                    >
                      <Icon className="ml-3 h-5 w-5 flex-shrink-0" />
                      {item.name}
                    </Link>
                    {hasChildren && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleMenu(item.name)}
                        className="p-2"
                      >
                        {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      </Button>
                    )}
                  </div>

                  {hasChildren && isExpanded && (
                    <div className="mr-4 mt-2 space-y-1">
                      {item.children.map((child) => {
                        const ChildIcon = child.icon;
                        return (
                          <Link
                            key={child.name}
                            to={child.href}
                            className={`flex items-center px-4 py-2 text-sm rounded-lg transition-colors ${
                              isActivePath(child.href) // Uses the useCallback version of isActivePath
                                ? 'bg-blue-50 text-blue-600'
                                : 'text-gray-600 hover:bg-gray-50'
                            }`}
                            onClick={() => setSidebarOpen(false)}
                          >
                            <ChildIcon className="ml-3 h-4 w-4 flex-shrink-0" />
                            {child.name}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:right-0 lg:flex lg:w-80 lg:flex-col">
        <div className="flex min-h-0 flex-1 flex-col bg-white shadow-xl">
          <div className="flex h-16 items-center justify-center bg-blue-600 px-4">
            <h1 className="text-xl font-bold text-white">TAV 360 CRM</h1>
          </div>

          <nav className="flex-1 space-y-2 px-4 py-6 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon;
              const hasChildren = item.children && item.children.length > 0;
              const isExpanded = expandedMenus[item.name];
              const isActive = isActiveParent(item); // Uses the useCallback version of isActiveParent

              return (
                <div key={item.name}>
                  <div className="flex items-center">
                    <Link
                      to={item.href}
                      className={`flex items-center flex-1 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                        isActive
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="ml-3 h-5 w-5 flex-shrink-0" />
                      {item.name}
                    </Link>
                    {hasChildren && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleMenu(item.name)}
                        className="p-2"
                      >
                        {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      </Button>
                    )}
                  </div>

                  {hasChildren && isExpanded && (
                    <div className="mr-4 mt-2 space-y-1">
                      {item.children.map((child) => {
                        const ChildIcon = child.icon;
                        return (
                          <Link
                            key={child.name}
                            to={child.href}
                            className={`flex items-center px-4 py-2 text-sm rounded-lg transition-colors ${
                              isActivePath(child.href) // Uses the useCallback version of isActivePath
                                ? 'bg-blue-50 text-blue-600'
                                : 'text-gray-600 hover:bg-gray-50'
                            }`}
                          >
                            <ChildIcon className="ml-3 h-4 w-4 flex-shrink-0" />
                            {child.name}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pr-80">
        <header className="bg-white shadow-sm border-b border-gray-200 lg:hidden">
          <div className="flex items-center justify-between h-16 px-4">
            <h1 className="text-lg font-semibold text-gray-900">TAV 360 CRM</h1>
            <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(true)}>
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </header>

        <main>
          {children}
        </main>
      </div>
    </div>
  );
}

