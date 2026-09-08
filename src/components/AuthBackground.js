import { StyleSheet } from 'react-native';
import Svg, { Circle, Line, Path, Rect } from 'react-native-svg';
import { colors } from '../theme';

export default function AuthBackground() {
  return (
    <Svg
      style={StyleSheet.absoluteFill}
      viewBox="0 0 400 800"
      preserveAspectRatio="xMidYMid slice"
    >
      <Rect x={0} y={0} width={400} height={800} fill={colors.sand} />

      <Circle cx={30} cy={80} r={160} fill={colors.ocean} opacity={0.1} />
      <Circle cx={370} cy={700} r={190} fill={colors.ocean} opacity={0.08} />
      <Circle cx={340} cy={140} r={60} fill={colors.ocean} opacity={0.14} />
      <Circle cx={40} cy={540} r={90} fill={colors.ocean} opacity={0.1} />

      <Circle cx={430} cy={60} r={140} stroke={colors.ocean} strokeWidth={2} fill="none" opacity={0.3} />
      <Circle cx={-30} cy={770} r={150} stroke={colors.ocean} strokeWidth={2} fill="none" opacity={0.3} />

      <Path
        d="M300,10 Q380,55 355,140"
        stroke={colors.sun}
        strokeWidth={2}
        fill="none"
        strokeDasharray="7,7"
        opacity={0.7}
      />
      <Path
        d="M15,690 Q55,755 145,770"
        stroke={colors.sun}
        strokeWidth={2}
        fill="none"
        strokeDasharray="7,7"
        opacity={0.7}
      />

      <Line x1={0} y1={390} x2={400} y2={390} stroke={colors.ocean} strokeWidth={1.5} opacity={0.25} />

      <Rect x={8} y={350} width={78} height={78} stroke={colors.ocean} strokeWidth={1} fill="none" opacity={0.2} />
      <Line x1={8} y1={376} x2={86} y2={376} stroke={colors.ocean} strokeWidth={1} opacity={0.2} />
      <Line x1={8} y1={402} x2={86} y2={402} stroke={colors.ocean} strokeWidth={1} opacity={0.2} />
      <Line x1={34} y1={350} x2={34} y2={428} stroke={colors.ocean} strokeWidth={1} opacity={0.2} />
      <Line x1={60} y1={350} x2={60} y2={428} stroke={colors.ocean} strokeWidth={1} opacity={0.2} />

      <Rect x={314} y={350} width={78} height={78} stroke={colors.ocean} strokeWidth={1} fill="none" opacity={0.2} />
      <Line x1={314} y1={376} x2={392} y2={376} stroke={colors.ocean} strokeWidth={1} opacity={0.2} />
      <Line x1={314} y1={402} x2={392} y2={402} stroke={colors.ocean} strokeWidth={1} opacity={0.2} />
      <Line x1={340} y1={350} x2={340} y2={428} stroke={colors.ocean} strokeWidth={1} opacity={0.2} />
      <Line x1={366} y1={350} x2={366} y2={428} stroke={colors.ocean} strokeWidth={1} opacity={0.2} />

      <Line x1={20} y1={430} x2={8} y2={800} stroke={colors.ocean} strokeWidth={1} strokeDasharray="4,7" opacity={0.2} />
      <Line x1={72} y1={430} x2={110} y2={800} stroke={colors.ocean} strokeWidth={1} strokeDasharray="4,7" opacity={0.2} />
      <Line x1={328} y1={430} x2={290} y2={800} stroke={colors.ocean} strokeWidth={1} strokeDasharray="4,7" opacity={0.2} />
      <Line x1={380} y1={430} x2={392} y2={800} stroke={colors.ocean} strokeWidth={1} strokeDasharray="4,7" opacity={0.2} />
    </Svg>
  );
}
