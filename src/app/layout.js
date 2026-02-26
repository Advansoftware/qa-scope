import { Inter } from 'next/font/google';
import './globals.css';
import ThemeRegistry from '@/components/ThemeRegistry';
import AppShell from '@/components/layout/AppShell';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata = {
  title: 'QA Scope - Gerenciador de Escopos de Teste',
  description: 'Ferramenta de QA para gerenciar escopos de teste, tarefas, e comandos de terminal',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <body style={{ margin: 0 }}>
        <ThemeRegistry>
          <AppShell>
            {children}
          </AppShell>
        </ThemeRegistry>
      </body>
    </html>
  );
}
