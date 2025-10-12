import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Building2, Menu, X, Bell, HelpCircle, User, Settings, LogOut, Users, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useData } from '@/contexts/DataContext';

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { knowledgeEntries, promisesToPay } = useData();

  const notificationCount = knowledgeEntries.filter(k => k.status === 'pending').length +
    promisesToPay.filter(p => !p.fulfilled && new Date(p.promised_datetime) <= new Date()).length;

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/canvas', label: 'Canvas' },
    { href: '/knowledge', label: 'Base de Conhecimento' },
    { href: '/analytics', label: 'Analytics' },
  ];

  const isActive = (path: string) => location.pathname === path || 
    (path === '/dashboard' && location.pathname === '/');

  return (
    <nav className="border-b bg-card">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Building2 className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold text-primary">Lilaas Cobra AI</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map(link => (
              <Link
                key={link.href}
                to={link.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isActive(link.href) ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2">
            {/* Help Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <HelpCircle className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Ajuda</DropdownMenuLabel>
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
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  {notificationCount > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -right-1 -top-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                    >
                      {notificationCount}
                    </Badge>
                  )}
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
                      <p className="text-xs text-muted-foreground">R$ {p.amount_promised.toFixed(2)}</p>
                    </div>
                  </DropdownMenuItem>
                ))}
                {notificationCount === 0 && (
                  <DropdownMenuItem>
                    <p className="text-sm text-muted-foreground">Nenhuma notificação</p>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>AS</AvatarFallback>
                  </Avatar>
                  <span className="hidden md:inline text-sm">Ana Silva</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-medium">Ana Silva</p>
                    <p className="text-xs text-muted-foreground">Property Manager</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  Configurações de Perfil
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Users className="mr-2 h-4 w-4" />
                  Gerenciar Equipe
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Faturamento
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  Configurações
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <div className="flex flex-col gap-4 mt-8">
                  {navLinks.map(link => (
                    <Link
                      key={link.href}
                      to={link.href}
                      onClick={() => setMobileOpen(false)}
                      className={`text-lg font-medium transition-colors hover:text-primary ${
                        isActive(link.href) ? 'text-primary' : 'text-muted-foreground'
                      }`}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
