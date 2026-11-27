import { Directory, Filesystem } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

window.saveNativeBackup = async (fileName, base64Data) => {
  await Filesystem.writeFile({
    path: `backups/${fileName}`,
    data: base64Data,
    directory: Directory.Data,
    recursive: true,
  });
};

window.shareNativeBackup = async (fileName, base64Data) => {
  const { uri } = await Filesystem.writeFile({
    path: fileName,
    data: base64Data,
    directory: Directory.Cache,
  });

  await Share.share({
    title: 'Shop Debts backup',
    text: 'Shop Debts backup file',
    files: [uri],
    dialogTitle: 'Save or share backup',
  });
};
