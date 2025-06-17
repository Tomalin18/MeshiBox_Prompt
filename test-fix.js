// 測試文件系統權限修復
// 這個腳本可以在 Expo 應用中運行來測試修復

import * as FileSystem from 'expo-file-system';

async function testFileSystemFix() {
  console.log('Testing file system permissions...');
  
  try {
    // 測試 ensureDirectoryExists 邏輯
    const documentDirectory = FileSystem.documentDirectory;
    console.log('Document directory:', documentDirectory);
    
    if (documentDirectory) {
      const dirInfo = await FileSystem.getInfoAsync(documentDirectory);
      console.log('Directory exists:', dirInfo.exists);
      
      if (!dirInfo.exists) {
        console.log('Creating directory...');
        await FileSystem.makeDirectoryAsync(documentDirectory, { intermediates: true });
      }
      
      // 測試寫入文件
      const testFile = documentDirectory + 'test.txt';
      await FileSystem.writeAsStringAsync(testFile, 'Test content');
      console.log('✅ File write successful');
      
      // 清理測試文件
      await FileSystem.deleteAsync(testFile);
      console.log('✅ Test file cleaned up');
      
    } else {
      // 測試緩存目錄降級
      const cacheDirectory = FileSystem.cacheDirectory;
      console.log('Falling back to cache directory:', cacheDirectory);
      
      if (cacheDirectory) {
        const testFile = cacheDirectory + 'test.txt';
        await FileSystem.writeAsStringAsync(testFile, 'Test content');
        console.log('✅ Cache directory write successful');
        
        await FileSystem.deleteAsync(testFile);
        console.log('✅ Cache test file cleaned up');
      }
    }
    
    console.log('🎉 All file system tests passed!');
    
  } catch (error) {
    console.error('❌ File system test failed:', error);
  }
}

// 導出測試函數
export { testFileSystemFix };

// 如果直接運行此腳本
if (typeof window !== 'undefined') {
  testFileSystemFix();
} 