const Subject = require('../models/Subject');
const Teacher = require('../models/Teacher');
const Room = require('../models/Room');
const Group = require('../models/Group');
const Session = require('../models/Session');
const Timetable = require('../models/Timetable');

// Slot configuration
const SLOT_DURATION = 1.5; // hours
const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

// Slot times for each day
const MORNING_SLOTS = [
  { start: '08:15', end: '09:45', index: 0 },
  { start: '10:00', end: '11:30', index: 1 },
  { start: '11:45', end: '13:15', index: 2 }
];

const AFTERNOON_SLOTS = [
  { start: '15:00', end: '16:30', index: 3 },
  { start: '16:45', end: '18:15', index: 4 }
];

const ALL_SLOTS = [...MORNING_SLOTS, ...AFTERNOON_SLOTS];

// Scoring weights (configurable)
const WEIGHTS = {
  teacherPreference: 3,
  balance: 2,
  nonAdjacency: 1,
  roomFit: 1
};

// Get available slots for a day (exclude Wednesday afternoon)
function getAvailableSlotsForDay(day) {
  if (day === 'wednesday') {
    return MORNING_SLOTS;
  }
  return ALL_SLOTS;
}

// Check if slot is in morning or afternoon
function getTimeOfDay(slotIndex) {
  return slotIndex < 3 ? 'morning' : 'afternoon';
}

// Generate session demands from subjects
async function generateSessionDemands(subjects, rounding = 'up') {
  const demands = [];
  
  for (const subject of subjects) {
    const teacher = await Teacher.findById(subject.teacherId);
    const groups = await Group.find({ _id: { $in: subject.groupIds } });
    
    if (!teacher || groups.length === 0) continue;
    
    const slotsPerSession = subject.slotsPerSession;
    const totalSlots = subject.weeklySlots;
    
    // Calculate number of sessions
    let numSessions;
    if (slotsPerSession === 1) {
      numSessions = totalSlots;
    } else {
      // For 2-slot sessions (TP)
      numSessions = Math.floor(totalSlots / slotsPerSession);
      const remainder = totalSlots % slotsPerSession;
      
      if (remainder > 0 && rounding === 'up') {
        numSessions += 1; // Add one more session to cover remaining slots
      }
    }
    
    // Create session demands
    for (let i = 0; i < numSessions; i++) {
      demands.push({
        subjectId: subject._id,
        subjectName: subject.name,
        subjectCode: subject.code,
        teacherId: teacher._id,
        teacher: teacher,
        groupIds: subject.groupIds,
        groups: groups,
        type: subject.type,
        slotsPerSession: slotsPerSession,
        totalGroupSize: groups.reduce((sum, g) => sum + g.size, 0)
      });
    }
  }
  
  return demands;
}

// Order demands by difficulty (TP first, larger groups, etc.)
function orderDemandsByDifficulty(demands) {
  return demands.sort((a, b) => {
    // TP sessions first (require 2 consecutive slots)
    if (a.slotsPerSession !== b.slotsPerSession) {
      return b.slotsPerSession - a.slotsPerSession;
    }
    
    // Larger groups first (harder to find rooms)
    if (a.totalGroupSize !== b.totalGroupSize) {
      return b.totalGroupSize - a.totalGroupSize;
    }
    
    // TP type prioritized
    const typeOrder = { 'TP': 3, 'TD': 2, 'CM': 1 };
    return typeOrder[b.type] - typeOrder[a.type];
  });
}

// Check if teacher is available for a slot
function isTeacherAvailable(teacher, day, slotIndex, slotCount, occupiedSlots) {
  const timeOfDay = getTimeOfDay(slotIndex);
  
  // Check hard availability
  if (!teacher.availability[day][timeOfDay]) {
    return false;
  }
  
  // Check for conflicts in occupied slots
  for (let i = 0; i < slotCount; i++) {
    const checkIndex = slotIndex + i;
    const key = `teacher_${teacher._id}_${day}_${checkIndex}`;
    if (occupiedSlots.has(key)) {
      return false;
    }
  }
  
  return true;
}

// Check if groups are available for a slot
function areGroupsAvailable(groupIds, day, slotIndex, slotCount, occupiedSlots) {
  for (const groupId of groupIds) {
    for (let i = 0; i < slotCount; i++) {
      const checkIndex = slotIndex + i;
      const key = `group_${groupId}_${day}_${checkIndex}`;
      if (occupiedSlots.has(key)) {
        return false;
      }
    }
  }
  return true;
}

// Check if room is available and suitable
async function isRoomAvailable(room, demand, day, slotIndex, slotCount, occupiedSlots) {
  // Check capacity
  if (room.capacity < demand.totalGroupSize) {
    return false;
  }
  
  // Check type allowed
  if (!room.typesAllowed.includes(demand.type)) {
    return false;
  }
  
  // Check for conflicts in occupied slots
  for (let i = 0; i < slotCount; i++) {
    const checkIndex = slotIndex + i;
    const key = `room_${room._id}_${day}_${checkIndex}`;
    if (occupiedSlots.has(key)) {
      return false;
    }
  }
  
  return true;
}

// Calculate score for a placement
function calculateScore(demand, day, slotIndex, room) {
  let score = 0;
  const timeOfDay = getTimeOfDay(slotIndex);
  
  // Teacher preference score
  const preference = demand.teacher.preferences[day][timeOfDay];
  if (preference === 'prefer') {
    score += WEIGHTS.teacherPreference * 10;
  } else if (preference === 'avoid') {
    score -= WEIGHTS.teacherPreference * 5;
  }
  
  // Room fit bonus (prefer tight fit)
  const capacitySlack = room.capacity - demand.totalGroupSize;
  if (capacitySlack < 10) {
    score += WEIGHTS.roomFit * 5;
  } else if (capacitySlack < 30) {
    score += WEIGHTS.roomFit * 2;
  }
  
  return score;
}

// Find best placement for a demand
async function findBestPlacement(demand, rooms, occupiedSlots, dayDistribution) {
  const candidates = [];
  
  for (const day of DAYS) {
    const availableSlots = getAvailableSlotsForDay(day);
    
    for (const slot of availableSlots) {
      const slotIndex = slot.index;
      
      // Check if we can fit the required consecutive slots
      if (demand.slotsPerSession === 2) {
        // Need two consecutive slots
        const nextSlot = availableSlots.find(s => s.index === slotIndex + 1);
        if (!nextSlot) continue;
      }
      
      // Check teacher availability
      if (!isTeacherAvailable(demand.teacher, day, slotIndex, demand.slotsPerSession, occupiedSlots)) {
        continue;
      }
      
      // Check groups availability
      if (!areGroupsAvailable(demand.groupIds, day, slotIndex, demand.slotsPerSession, occupiedSlots)) {
        continue;
      }
      
      // Check rooms
      for (const room of rooms) {
        if (await isRoomAvailable(room, demand, day, slotIndex, demand.slotsPerSession, occupiedSlots)) {
          const score = calculateScore(demand, day, slotIndex, room);
          
          // Bonus for spreading across days
          const dayUsage = dayDistribution[demand.subjectId]?.[day] || 0;
          const balanceBonus = WEIGHTS.balance * (5 - dayUsage);
          
          candidates.push({
            day,
            slotIndex,
            room,
            score: score + balanceBonus
          });
        }
      }
    }
  }
  
  // Sort by score descending
  candidates.sort((a, b) => b.score - a.score);
  
  return candidates[0] || null;
}

// Mark slots as occupied
function markSlotOccupied(occupiedSlots, teacherId, groupIds, roomId, day, slotIndex, slotCount) {
  for (let i = 0; i < slotCount; i++) {
    const checkIndex = slotIndex + i;
    occupiedSlots.add(`teacher_${teacherId}_${day}_${checkIndex}`);
    groupIds.forEach(gid => {
      occupiedSlots.add(`group_${gid}_${day}_${checkIndex}`);
    });
    occupiedSlots.add(`room_${roomId}_${day}_${checkIndex}`);
  }
}

// Main generation function
async function generateTimetable(weekRef, scope = 'all', groupId = null, rounding = 'up') {
  try {
    // Fetch all necessary data
    let subjectsQuery = {};
    if (scope === 'group' && groupId) {
      subjectsQuery = { groupIds: groupId };
    }
    
    const subjects = await Subject.find(subjectsQuery).populate('teacherId groupIds');
    const rooms = await Room.find();
    
    if (subjects.length === 0) {
      throw new Error('No subjects found');
    }
    
    if (rooms.length === 0) {
      throw new Error('No rooms available');
    }
    
    // Generate session demands
    const demands = await generateSessionDemands(subjects, rounding);
    const orderedDemands = orderDemandsByDifficulty(demands);
    
    // Track occupied slots and distribution
    const occupiedSlots = new Set();
    const dayDistribution = {}; // subjectId -> { day: count }
    const placedSessions = [];
    const unplacedDemands = [];
    
    // Place each demand
    for (const demand of orderedDemands) {
      const placement = await findBestPlacement(demand, rooms, occupiedSlots, dayDistribution);
      
      if (placement) {
        // Create session
        const session = new Session({
          subjectId: demand.subjectId,
          teacherId: demand.teacherId,
          groupIds: demand.groupIds,
          roomId: placement.room._id,
          day: placement.day,
          startSlotIndex: placement.slotIndex,
          slotCount: demand.slotsPerSession,
          type: demand.type
        });
        
        await session.save();
        placedSessions.push(session);
        
        // Mark slots as occupied
        markSlotOccupied(
          occupiedSlots,
          demand.teacherId,
          demand.groupIds,
          placement.room._id,
          placement.day,
          placement.slotIndex,
          demand.slotsPerSession
        );
        
        // Update distribution
        if (!dayDistribution[demand.subjectId]) {
          dayDistribution[demand.subjectId] = {};
        }
        dayDistribution[demand.subjectId][placement.day] = 
          (dayDistribution[demand.subjectId][placement.day] || 0) + 1;
      } else {
        unplacedDemands.push(demand);
      }
    }
    
    // Group sessions by group and create timetables
    const groupSessionMap = new Map();
    
    for (const session of placedSessions) {
      for (const gid of session.groupIds) {
        const gidStr = gid.toString();
        if (!groupSessionMap.has(gidStr)) {
          groupSessionMap.set(gidStr, []);
        }
        groupSessionMap.get(gidStr).push(session._id);
      }
    }
    
    // Create or update timetable documents
    const timetables = [];
    for (const [gid, sessionIds] of groupSessionMap.entries()) {
      const timetable = await Timetable.findOneAndUpdate(
        { groupId: gid, weekRef },
        { 
          groupId: gid,
          weekRef,
          sessions: sessionIds
        },
        { upsert: true, new: true }
      );
      timetables.push(timetable);
    }
    
    return {
      success: true,
      timetables,
      stats: {
        totalDemands: orderedDemands.length,
        placedSessions: placedSessions.length,
        unplacedDemands: unplacedDemands.length
      },
      unplacedDemands: unplacedDemands.map(d => ({
        subject: d.subjectName,
        type: d.type,
        groups: d.groups.map(g => g.name)
      }))
    };
  } catch (error) {
    throw error;
  }
}

// Validate a session placement
async function validateSession(sessionData) {
  const { teacherId, groupIds, roomId, day, startSlotIndex, slotCount, type } = sessionData;
  
  const errors = [];
  
  // Check teacher
  const teacher = await Teacher.findById(teacherId);
  if (!teacher) {
    errors.push('Teacher not found');
    return { valid: false, errors };
  }
  
  // Check teacher availability
  const timeOfDay = getTimeOfDay(startSlotIndex);
  if (!teacher.availability[day][timeOfDay]) {
    errors.push(`Teacher not available on ${day} ${timeOfDay}`);
  }
  
  // Check Wednesday afternoon
  if (day === 'wednesday' && timeOfDay === 'afternoon') {
    errors.push('Wednesday afternoon is excluded');
  }
  
  // Check room
  const room = await Room.findById(roomId);
  if (!room) {
    errors.push('Room not found');
  } else {
    if (!room.typesAllowed.includes(type)) {
      errors.push(`Room does not allow ${type} sessions`);
    }
    
    const groups = await Group.find({ _id: { $in: groupIds } });
    const totalSize = groups.reduce((sum, g) => sum + g.size, 0);
    if (room.capacity < totalSize) {
      errors.push(`Room capacity (${room.capacity}) insufficient for ${totalSize} students`);
    }
  }
  
  // Check slot validity
  const availableSlots = getAvailableSlotsForDay(day);
  const slotExists = availableSlots.some(s => s.index === startSlotIndex);
  if (!slotExists) {
    errors.push(`Invalid slot index ${startSlotIndex} for ${day}`);
  }
  
  // For 2-slot sessions, check second slot exists
  if (slotCount === 2) {
    const secondSlotExists = availableSlots.some(s => s.index === startSlotIndex + 1);
    if (!secondSlotExists) {
      errors.push(`Second consecutive slot not available`);
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

// Check for conflicts with existing sessions
async function checkConflicts(sessionData, excludeSessionId = null) {
  const { teacherId, groupIds, roomId, day, startSlotIndex, slotCount } = sessionData;
  
  const conflicts = [];
  
  // Build query to find potentially conflicting sessions
  const query = {
    day,
    $or: [
      { teacherId },
      { groupIds: { $in: groupIds } },
      { roomId }
    ]
  };
  
  if (excludeSessionId) {
    query._id = { $ne: excludeSessionId };
  }
  
  const existingSessions = await Session.find(query);
  
  for (const existing of existingSessions) {
    const existingEnd = existing.startSlotIndex + existing.slotCount - 1;
    const newEnd = startSlotIndex + slotCount - 1;
    
    // Check for overlap
    const overlaps = !(newEnd < existing.startSlotIndex || startSlotIndex > existingEnd);
    
    if (overlaps) {
      if (existing.teacherId.toString() === teacherId.toString()) {
        conflicts.push({ type: 'teacher', session: existing });
      }
      if (existing.roomId.toString() === roomId.toString()) {
        conflicts.push({ type: 'room', session: existing });
      }
      for (const gid of groupIds) {
        if (existing.groupIds.some(egid => egid.toString() === gid.toString())) {
          conflicts.push({ type: 'group', groupId: gid, session: existing });
        }
      }
    }
  }
  
  return conflicts;
}

module.exports = {
  generateTimetable,
  validateSession,
  checkConflicts,
  DAYS,
  MORNING_SLOTS,
  AFTERNOON_SLOTS,
  ALL_SLOTS,
  getAvailableSlotsForDay
};
