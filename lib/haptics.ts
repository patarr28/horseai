// Utility for triggering haptic feedback on supported devices

export const triggerHaptic = (type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' = 'light') => {
    if (typeof window === 'undefined' || !navigator.vibrate) return;

    switch (type) {
        case 'light':
            navigator.vibrate(10);
            break;
        case 'medium':
            navigator.vibrate(20);
            break;
        case 'heavy':
            navigator.vibrate(40);
            break;
        case 'success':
            navigator.vibrate([10, 30, 20]);
            break;
        case 'warning':
            navigator.vibrate([20, 40, 20]);
            break;
        case 'error':
            navigator.vibrate([30, 50, 30, 50, 30]);
            break;
        default:
            navigator.vibrate(10);
    }
};
