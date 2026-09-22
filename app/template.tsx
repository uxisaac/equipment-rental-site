// A template (unlike a layout) re-mounts on every navigation, so each page gets a quick
// fade-and-rise as it arrives: home -> sign in -> the demo. It only animates opacity and a
// few pixels of movement, so it stays fast and light.
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-200 ease-out motion-reduce:animate-none">
      {children}
    </div>
  )
}
