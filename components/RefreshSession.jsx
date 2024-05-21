export default function refreshSession() {
    const event = new Event('visibilitychange');
    document.dispatchEvent(event);
  console.log(event,"its event")

  }