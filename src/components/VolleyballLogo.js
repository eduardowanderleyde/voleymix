import Svg, { Circle, Ellipse, G, Path } from 'react-native-svg';
import { colors } from '../theme';

const SEAM_D = 'M50,7 C24,18 24,44 50,50 C76,56 76,82 50,93';

export default function VolleyballLogo({ size = 72 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Circle cx={50} cy={50} r={43} fill={colors.white} stroke={colors.navy} strokeWidth={5} />

      <Path
        d="M50,7 C61,7 71,12 78,20 C67,16 56,17 50,24 C50,18 50,12 50,7 Z"
        fill={colors.sun}
      />

      <G transform="rotate(0 50 50)">
        <Path d={SEAM_D} stroke={colors.navy} strokeWidth={3.5} fill="none" strokeLinecap="round" />
      </G>
      <G transform="rotate(120 50 50)">
        <Path d={SEAM_D} stroke={colors.ocean} strokeWidth={3.5} fill="none" strokeLinecap="round" />
      </G>
      <G transform="rotate(240 50 50)">
        <Path d={SEAM_D} stroke={colors.navy} strokeWidth={3.5} fill="none" strokeLinecap="round" />
      </G>

      <Circle cx={50} cy={50} r={43} fill="none" stroke={colors.navy} strokeWidth={5} />
      <Ellipse
        cx={35}
        cy={32}
        rx={13}
        ry={7}
        fill={colors.white}
        opacity={0.55}
        transform="rotate(-25 35 32)"
      />
    </Svg>
  );
}
