import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bell, HelpCircle, User, Settings, LogOut, Users, CreditCard, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from '@/components/ui/navigation-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useData } from '@/contexts/DataContext';
import { cn } from '@/lib/utils';

// Logo components for Lilaas
const LogoIcon = ({ className, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) => (
  <img 
    src="/logo.svg" 
    alt="Lilaas Logo" 
    className={cn("h-6 w-6", className)}
    {...props}
  />
);

const LogoText = ({ className, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) => (
  <img 
    src="/lilaas-cobra.svg" 
    alt="Lilaas Cobra" 
    className={cn("h-4", className)}
    {...props}
  />
);

// Hamburger icon component
const HamburgerIcon = ({ className, ...props }: React.SVGAttributes<SVGElement>) => (
  <svg
    className={cn('pointer-events-none', className)}
    width={16}
    height={16}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M4 12L20 12"
      className="origin-center -translate-y-[7px] transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.1)] group-aria-expanded:translate-x-0 group-aria-expanded:translate-y-0 group-aria-expanded:rotate-[315deg]"
    />
    <path
      d="M4 12H20"
      className="origin-center transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.8)] group-aria-expanded:rotate-45"
    />
    <path
      d="M4 12H20"
      className="origin-center translate-y-[7px] transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.1)] group-aria-expanded:translate-y-0 group-aria-expanded:rotate-[135deg]"
    />
  </svg>
);

export function Navbar() {
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();
  const { knowledgeEntries, promisesToPay } = useData();
  const containerRef = useRef<HTMLElement>(null);

  const notificationCount = knowledgeEntries.filter(k => k.status === 'pending').length +
    promisesToPay.filter(p => !p.fulfilled && new Date(p.promised_datetime) <= new Date()).length;

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/canvas', label: 'Réguas' },
    { href: '/knowledge', label: 'Base de Conhecimento' },
    { href: '/analytics', label: 'Analytics' },
  ];

  const isActive = (path: string) => {
    if (path === '/canvas') {
      return location.pathname === '/canvas';
    }
    return location.pathname === path || (path === '/dashboard' && location.pathname === '/');
  };

  useEffect(() => {
    const checkWidth = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth;
        setIsMobile(width < 1024); // 1024px is lg breakpoint - show hamburger earlier to avoid squishing
      }
    };
    checkWidth();
    const resizeObserver = new ResizeObserver(checkWidth);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <header
      ref={containerRef}
      className={cn(
        'sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 md:px-6 [&_*]:no-underline'
      )}
    >
      <div className="container mx-auto flex h-16 max-w-screen-2xl items-center justify-between gap-4">
        {/* Left side */}
        <div className="flex items-center gap-2">
          {/* Mobile menu trigger */}
          {isMobile && (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  className="group h-9 w-9 hover:bg-accent hover:text-accent-foreground"
                  variant="ghost"
                  size="icon"
                >
                  <HamburgerIcon />
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-64 p-1">
                <NavigationMenu className="max-w-none">
                  <NavigationMenuList className="flex-col items-start gap-0">
                    {navLinks.map((link, index) => (
                      <NavigationMenuItem key={index} className="w-full">
                        <Link
                          to={link.href}
                          className={cn(
                            "flex w-full items-center rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground cursor-pointer no-underline",
                            isActive(link.href) && "bg-accent text-accent-foreground"
                          )}
                        >
                          {link.label}
                        </Link>
                      </NavigationMenuItem>
                    ))}
                  </NavigationMenuList>
                </NavigationMenu>
              </PopoverContent>
            </Popover>
          )}
          {/* Main nav */}
          <div className="flex items-center gap-6">
            <Link
              to="/dashboard"
              className="flex items-center space-x-3 hover:opacity-90 transition-opacity cursor-pointer"
            >
              <LogoIcon />
              <span className="hidden md:inline-block">
                <LogoText />
              </span>
            </Link>
            {/* Navigation menu */}
            {!isMobile && (
              <NavigationMenu className="flex">
                <NavigationMenuList className="gap-1">
                  {navLinks.map((link, index) => (
                    <NavigationMenuItem key={index}>
                      <NavigationMenuLink asChild>
                        <Link
                          to={link.href}
                          className={cn(
                            "group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:text-primary focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50",
                            isActive(link.href) ? "text-primary" : "text-muted-foreground"
                          )}
                        >
                          {link.label}
                        </Link>
                      </NavigationMenuLink>
                    </NavigationMenuItem>
                  ))}
                </NavigationMenuList>
              </NavigationMenu>
            )}
          </div>
        </div>
        {/* Right side */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            {/* Help Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <HelpCircle className="h-4 w-4" />
                  <span className="sr-only">Ajuda e Informações</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Ajuda & Suporte</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Central de Ajuda</DropdownMenuItem>
                <DropdownMenuItem>Documentação</DropdownMenuItem>
                <DropdownMenuItem>Contatar Suporte</DropdownMenuItem>
                <DropdownMenuItem>Enviar Feedback</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 relative">
                  <Bell className="h-4 w-4" />
                  {notificationCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                      {notificationCount > 9 ? '9+' : notificationCount}
                    </Badge>
                  )}
                  <span className="sr-only">Notificações</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>Notificações</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {knowledgeEntries.filter(k => k.status === 'pending').slice(0, 3).map(k => (
                  <DropdownMenuItem key={k.id}>
                    <div className="flex flex-col gap-1">
                      <p className="text-sm font-medium">Nova extração de conhecimento</p>
                      <p className="text-xs text-muted-foreground">{k.title}</p>
                    </div>
                  </DropdownMenuItem>
                ))}
                {promisesToPay.filter(p => !p.fulfilled && new Date(p.promised_datetime) <= new Date()).slice(0, 2).map(p => (
                  <DropdownMenuItem key={p.id}>
                    <div className="flex flex-col gap-1">
                      <p className="text-sm font-medium">Promessa de pagamento vencendo</p>
                      <p className="text-xs text-muted-foreground">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.amount_promised)}
                      </p>
                    </div>
                  </DropdownMenuItem>
                ))}
                {notificationCount === 0 && (
                  <DropdownMenuItem>
                    <p className="text-sm text-muted-foreground">Nenhuma notificação</p>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  Ver todas as notificações
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-9 px-2 py-0 hover:bg-accent hover:text-accent-foreground">
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="text-xs">AS</AvatarFallback>
                </Avatar>
                <ChevronDown className="h-3 w-3 ml-1" />
                <span className="sr-only">Menu do usuário</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">Ana Silva</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    Property Manager
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                Perfil
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Configurações
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Users className="mr-2 h-4 w-4" />
                Gerenciar Equipe
              </DropdownMenuItem>
              <DropdownMenuItem>
                <CreditCard className="mr-2 h-4 w-4" />
                Faturamento
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <LogOut className="mr-2 h-4 w-4" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
