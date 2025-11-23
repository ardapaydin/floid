import { useIsFetching } from "@tanstack/react-query";
import { useNProgress } from "@tanem/react-nprogress";

export default function LoadingBar() {
    const loading = useIsFetching();
    const { animationDuration, isFinished, progress } = useNProgress({
        isAnimating: loading > 0
    })

    return (
        <div className="fixed top-0 left-0 h-1 bg-orange-500 pointer-events-none transition-all ease-out" style={{ width: progress * 100 + "%", transition: `width ${animationDuration}ms ease-out`, opacity: isFinished ? 0 : 1 }} />
    )
}