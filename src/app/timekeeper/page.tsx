import TimekeeperClient from './TimekeeperClient';
import ChatWidget from '../components/ChatWidget';

export default function TimekeeperPage() {
  return (
    <div className="container py-4">
      <TimekeeperClient />
      <ChatWidget />
    </div>
  );
}
