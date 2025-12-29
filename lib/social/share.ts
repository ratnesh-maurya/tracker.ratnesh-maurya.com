'use client';

export interface ShareData {
  type: 'daily-goal' | 'habit-streak' | 'study-session' | 'achievement';
  title: string;
  description: string;
  value?: string | number;
}

export async function shareAchievement(data: ShareData): Promise<boolean> {
  const shareText = generateShareText(data);

  // Use Web Share API if available (mobile)
  if (navigator.share) {
    try {
      await navigator.share({
        title: 'Personal Tracker Achievement',
        text: shareText,
      });
      return true;
    } catch (err: any) {
      // User cancelled or error
      if (err.name !== 'AbortError') {
        console.error('Share error:', err);
      }
      return false;
    }
  }

  // Fallback: copy to clipboard
  try {
    await navigator.clipboard.writeText(shareText);
    // Show toast notification (you can enhance this)
    alert('Achievement copied to clipboard!');
    return true;
  } catch (err) {
    console.error('Clipboard error:', err);
    return false;
  }
}

function generateShareText(data: ShareData): string {
  const emoji = getEmojiForType(data.type);
  
  switch (data.type) {
    case 'daily-goal':
      return `${emoji} I just completed my daily goal! ${data.description} #PersonalTracker`;
    
    case 'habit-streak':
      return `${emoji} ${data.value} day streak! ${data.description} #HabitTracker #Streak`;
    
    case 'study-session':
      return `${emoji} Just completed ${data.value} hours of study! ${data.description} #StudyGoals`;
    
    case 'achievement':
      return `${emoji} Achievement unlocked: ${data.title}! ${data.description} #Achievement`;
    
    default:
      return `${emoji} ${data.title}: ${data.description} #PersonalTracker`;
  }
}

function getEmojiForType(type: ShareData['type']): string {
  switch (type) {
    case 'daily-goal':
      return '🎯';
    case 'habit-streak':
      return '🔥';
    case 'study-session':
      return '📚';
    case 'achievement':
      return '🏆';
    default:
      return '✨';
  }
}

