
// نظام معرف المستخدم الفريد
export const generateUserIdentifier = (): string => {
  const stored = localStorage.getItem('user_identifier');
  if (stored) {
    return stored;
  }
  
  // إنشاء معرف فريد يحتوي على معلومات الجهاز والوقت
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2);
  const userAgent = navigator.userAgent.substring(0, 20);
  const screenInfo = `${window.screen.width}x${window.screen.height}`;
  
  const identifier = `user_${timestamp}_${random}_${btoa(userAgent + screenInfo).substring(0, 10)}`;
  
  localStorage.setItem('user_identifier', identifier);
  return identifier;
};

export const getUserIdentifier = (): string => {
  return generateUserIdentifier();
};
