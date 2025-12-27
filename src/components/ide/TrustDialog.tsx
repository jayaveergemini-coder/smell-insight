import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ShieldCheck, FolderOpen, AlertTriangle } from 'lucide-react';

interface TrustDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

export function TrustDialog({ open, onOpenChange, onConfirm, onCancel }: TrustDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <ShieldCheck className="w-8 h-8 text-primary" />
            </div>
          </div>
          <AlertDialogTitle className="text-center text-lg">
            Trust This Application?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center space-y-3">
            <p className="text-sm text-muted-foreground">
              You can trust me, please proceed.
            </p>
            <div className="p-3 bg-secondary/50 rounded-lg border border-border">
              <div className="flex items-start gap-3">
                <FolderOpen className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div className="text-left">
                  <p className="text-xs font-medium text-foreground mb-1">
                    Folder Access Required
                  </p>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    This application needs access to read your project folder for code analysis. Your files will only be processed locally in your browser.
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground justify-center">
              <AlertTriangle className="w-3 h-3" />
              <span>No data is sent to external servers</span>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <AlertDialogCancel 
            onClick={onCancel}
            className="flex-1"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm}
            className="flex-1 bg-primary hover:bg-primary/90"
          >
            <ShieldCheck className="w-4 h-4 mr-2" />
            I Trust This App
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
