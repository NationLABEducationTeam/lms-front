import { FC } from 'react';
import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';

interface AttendanceStreakProps {
  days: number;
}

const AttendanceStreak: FC<AttendanceStreakProps> = ({ days = 3 }) => {
  return (
    <div className="flex items-center justify-center gap-3 text-lg text-orange-400 mb-8">
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ 
          scale: [0.8, 1.1, 0.9, 1],
          rotate: [0, 5, -5, 0]
        }}
        transition={{ 
          duration: 2,
          repeat: Infinity,
          repeatType: "reverse"
        }}
      >
        <Flame className="w-7 h-7" />
      </motion.div>
      <span className="font-semibold">{days}일 연속 출석하셨어요!</span>
    </div>
  );
};

export default AttendanceStreak; 