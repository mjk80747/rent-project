import Lottie from 'lottie-react';
import loaderAnimation from '../assets/loader.json';

const LottieLoader = ({ size = 120, label = 'Loading PGs...' }) => (
  <div className="lottie-loader" role="status" aria-live="polite">
    <Lottie
      animationData={loaderAnimation}
      loop
      autoplay
      style={{ width: size, height: size }}
    />
    {label && <p className="lottie-loader-label">{label}</p>}
  </div>
);

export default LottieLoader;
