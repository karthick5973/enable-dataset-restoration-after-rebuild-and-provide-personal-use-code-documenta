import { useState, useRef } from 'react';
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2, Loader2, Lock, Unlock, KeyRound, Download, RotateCcw, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { parseSpareParts } from '@/lib/excel/parseSpareParts';
import { useImportDataset, useVerifyPassword, useChangePassword, useSparePartsData } from '@/hooks/useSparePartsData';
import { useMaintenanceUnlock } from '@/hooks/useMaintenanceUnlock';
import { normalizeBackendError } from '@/lib/backendError';
import { toast } from 'sonner';
import { loadBackup, downloadBackup, hasBackup } from '@/lib/backup/sparePartsBackup';

export default function UploadCard() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState<string>('');
  const [unlockError, setUnlockError] = useState<string | null>(null);
  
  // Password change form state
  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [passwordChangeError, setPasswordChangeError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const importMutation = useImportDataset();
  const verifyPasswordMutation = useVerifyPassword();
  const changePasswordMutation = useChangePassword();
  const { isUnlocked, sessionPassword, unlock, setSessionPassword } = useMaintenanceUnlock();
  const { isBackendUnavailable, data: spareParts, importStatus } = useSparePartsData();

  // Check if backup exists and backend has no data
  const backupExists = hasBackup();
  const backendHasNoData = importStatus === 0;
  const canRestore = backupExists && backendHasNoData && isUnlocked;

  const handleUnlock = async () => {
    setUnlockError(null);
    
    try {
      const isValid = await verifyPasswordMutation.mutateAsync(password);
      
      if (isValid) {
        unlock(password);
        setPassword('');
        toast.success('Upload access unlocked for this session');
      } else {
        setUnlockError('Incorrect password. Please verify and try again.');
      }
    } catch (err) {
      const normalized = normalizeBackendError(err);
      setUnlockError(normalized.userMessage);
      console.error('Password verification error:', normalized.originalError);
    }
  };

  const handlePasswordChange = async () => {
    setPasswordChangeError(null);
    
    // Validate inputs
    if (!currentPassword.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      setPasswordChangeError('All fields are required.');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setPasswordChangeError('New password and confirm password do not match.');
      return;
    }
    
    try {
      const success = await changePasswordMutation.mutateAsync({
        oldPassword: currentPassword,
        newPassword: newPassword,
      });
      
      if (success) {
        toast.success('Maintenance password changed successfully!');
        // Update session password to the new one
        setSessionPassword(newPassword);
        // Clear form
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setPasswordChangeError(null);
      } else {
        setPasswordChangeError('Current password is incorrect.');
      }
    } catch (err) {
      const normalized = normalizeBackendError(err);
      setPasswordChangeError(normalized.userMessage);
      console.error('Password change error:', normalized.originalError);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setError(null);
    
    if (!file) {
      setSelectedFile(null);
      return;
    }

    const validExtensions = ['.xlsx', '.xls'];
    const fileExtension = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));
    
    if (!validExtensions.includes(fileExtension)) {
      setError('Please select a valid Excel file (.xlsx or .xls)');
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    setSelectedFile(file);
  };

  const handleImport = async () => {
    if (!selectedFile || !isUnlocked || !sessionPassword) return;

    setError(null);

    try {
      const spareParts = await parseSpareParts(selectedFile);
      
      if (spareParts.length === 0) {
        setError('No spare parts found in the Excel file. Please ensure your file contains data rows.');
        return;
      }

      await importMutation.mutateAsync({ spareParts, password: sessionPassword });
      
      toast.success(`Successfully imported ${spareParts.length} spare parts!`);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      const normalized = normalizeBackendError(err);
      
      // Provide specific error messages
      let errorMessage = normalized.userMessage;
      
      if (normalized.category === 'password') {
        errorMessage = 'Import failed: Invalid maintenance password';
      } else if (normalized.category === 'connectivity') {
        errorMessage = 'Import failed: Backend unavailable. Please check your connection and try again.';
      } else if (normalized.category === 'parse') {
        errorMessage = 'Import failed: Unable to parse Excel file';
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Import error:', normalized.originalError);
    }
  };

  const handleDownloadBackup = () => {
    try {
      downloadBackup();
      toast.success('Backup downloaded successfully!');
    } catch (err) {
      toast.error('Failed to download backup');
      console.error('Download backup error:', err);
    }
  };

  const handleRestoreBackup = async () => {
    if (!isUnlocked || !sessionPassword) return;

    try {
      const backup = loadBackup();
      if (!backup) {
        toast.error('No backup available to restore');
        return;
      }

      await importMutation.mutateAsync({ 
        spareParts: backup.spareParts, 
        password: sessionPassword 
      });
      
      toast.success(`Successfully restored ${backup.recordCount} spare parts from backup!`);
    } catch (err) {
      const normalized = normalizeBackendError(err);
      
      let errorMessage = normalized.userMessage;
      if (normalized.category === 'password') {
        errorMessage = 'Restore failed: Invalid maintenance password';
      } else if (normalized.category === 'connectivity') {
        errorMessage = 'Restore failed: Backend unavailable. Please check your connection and try again.';
      }
      
      toast.error(errorMessage);
      console.error('Restore backup error:', normalized.originalError);
    }
  };

  const isImporting = importMutation.isPending;
  const isVerifying = verifyPasswordMutation.isPending;
  const isChangingPassword = changePasswordMutation.isPending;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5 text-primary" />
          Upload Master Data
        </CardTitle>
        <CardDescription>
          Select an Excel file (.xlsx or .xls) containing your spare parts inventory
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isBackendUnavailable && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Backend is currently unavailable. Upload and unlock features are disabled until connection is restored.
            </AlertDescription>
          </Alert>
        )}
        
        {!isUnlocked ? (
          <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Lock className="w-4 h-4" />
              <p className="text-sm font-medium">Upload access is locked</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="maintenance-password">Enter maintenance password to unlock uploads</Label>
              <div className="flex gap-2">
                <Input
                  id="maintenance-password"
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setUnlockError(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && password.trim() && !isVerifying && !isBackendUnavailable) {
                      handleUnlock();
                    }
                  }}
                  disabled={isVerifying || isBackendUnavailable}
                  className="flex-1"
                />
                <Button 
                  onClick={handleUnlock} 
                  disabled={!password.trim() || isVerifying || isBackendUnavailable}
                >
                  {isVerifying ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <Unlock className="w-4 h-4 mr-2" />
                      Unlock
                    </>
                  )}
                </Button>
              </div>
            </div>
            {unlockError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{unlockError}</AlertDescription>
              </Alert>
            )}
          </div>
        ) : (
          <>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileSelect}
                  disabled={isImporting || isBackendUnavailable}
                  className="block w-full text-sm text-foreground
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-medium
                    file:bg-primary file:text-primary-foreground
                    file:cursor-pointer file:transition-colors
                    hover:file:bg-primary/90
                    disabled:opacity-50 disabled:cursor-not-allowed
                    cursor-pointer"
                />
              </div>
              <Button
                onClick={handleImport}
                disabled={!selectedFile || isImporting || isBackendUnavailable}
                className="sm:w-auto w-full"
              >
                {isImporting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Import
                  </>
                )}
              </Button>
            </div>

            {selectedFile && !error && (
              <Alert className="bg-primary/5 border-primary/20">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <AlertDescription className="text-foreground">
                  <strong>{selectedFile.name}</strong> ready to import
                </AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Local Backup Actions */}
            {backupExists && (
              <>
                <Separator className="my-4" />
                <div className="space-y-3 p-4 border rounded-lg bg-muted/30">
                  <div className="flex items-center gap-2 text-foreground">
                    <Database className="w-4 h-4" />
                    <p className="text-sm font-medium">Local Backup Available</p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    A backup of your last imported dataset is stored in your browser.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button
                      variant="outline"
                      onClick={handleDownloadBackup}
                      className="sm:flex-1"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download Backup (JSON)
                    </Button>
                    {canRestore && (
                      <Button
                        variant="default"
                        onClick={handleRestoreBackup}
                        disabled={isImporting || isBackendUnavailable}
                        className="sm:flex-1"
                      >
                        {isImporting ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Restoring...
                          </>
                        ) : (
                          <>
                            <RotateCcw className="w-4 h-4 mr-2" />
                            Restore from Backup
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                  {backendHasNoData && !canRestore && (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Unlock upload access above to restore your backup to the backend.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </>
            )}

            <Separator className="my-6" />

            {/* Password Change Section */}
            <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
              <div className="flex items-center gap-2 text-foreground">
                <KeyRound className="w-4 h-4" />
                <p className="text-sm font-medium">Change maintenance password</p>
              </div>
              
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Current password</Label>
                  <Input
                    id="current-password"
                    type="password"
                    placeholder="Enter current password"
                    value={currentPassword}
                    onChange={(e) => {
                      setCurrentPassword(e.target.value);
                      setPasswordChangeError(null);
                    }}
                    disabled={isChangingPassword || isBackendUnavailable}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-password">New password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      setPasswordChangeError(null);
                    }}
                    disabled={isChangingPassword || isBackendUnavailable}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm new password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setPasswordChangeError(null);
                    }}
                    disabled={isChangingPassword || isBackendUnavailable}
                  />
                </div>

                <Button
                  onClick={handlePasswordChange}
                  disabled={
                    !currentPassword.trim() ||
                    !newPassword.trim() ||
                    !confirmPassword.trim() ||
                    isChangingPassword ||
                    isBackendUnavailable
                  }
                  className="w-full"
                >
                  {isChangingPassword ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Changing Password...
                    </>
                  ) : (
                    'Change Password'
                  )}
                </Button>

                {passwordChangeError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{passwordChangeError}</AlertDescription>
                  </Alert>
                )}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
