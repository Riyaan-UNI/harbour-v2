import { Link } from 'react-router-dom';
import { useProfile } from '@legacy/context/ProfileContext.jsx';
import { publicUrl } from '../../lib/public-url';

export function WelcomePlaceholder(): JSX.Element {
  const { profile } = useProfile();
  return (
    <section className="page harbour-welcome-placeholder" aria-labelledby="welcome-placeholder-title">
      <img className="welcome-mascot" src={profile?.photo || profile?.avatar || publicUrl('/art/mascot-otter.webp')} alt="" />
      <p className="eyebrow">YOU MADE IT TO HONG KONG</p>
      <h1 id="welcome-placeholder-title" className="welcome-placeholder-title">We’re building your Harbour dashboard.</h1>
      <p className="welcome-placeholder-copy">{profile?.name ? `Welcome, ${profile.name}. ` : ''}Your profile is ready and your next tools are already here when you need them.</p>
      <div className="welcome-placeholder-actions">
        <Link className="button" to="/app/home">Explore Harbour</Link>
        <Link className="quiet-button" to="/arrival?replay=1">Replay your arrival story</Link>
      </div>
    </section>
  );
}
