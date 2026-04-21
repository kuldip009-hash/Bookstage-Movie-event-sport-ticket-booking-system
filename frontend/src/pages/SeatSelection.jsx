import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { Clock, Users, Info, ArrowRight, ZoomIn, ZoomOut, RotateCcw, Wifi } from 'lucide-react'
import { useBookingStore } from '../store'
import { seatsApi, eventSeatsApi } from '../services/api'
import toast from 'react-hot-toast'

const CINEMA_CATEGORIES = [
    { id: 'balcony', label: 'Balcony', price: 250, color: '#7C3AED' },
    { id: 'premium', label: 'Premium', price: 350, color: '#FF6B35' },
    { id: 'standard', label: 'Standard', price: 450, color: '#3B82F6' },
]

const CONCERT_CATEGORIES = [
    { id: 'vip', label: 'VIP Zone', price: 8000, color: '#F59E0B', rows: ['A', 'B'], seatsPerRow: 8 },
    { id: 'gold', label: 'Gold', price: 4999, color: '#FF2D55', rows: ['C', 'D', 'E'], seatsPerRow: 12 },
    { id: 'silver', label: 'Silver', price: 2999, color: '#6B7280', rows: ['F', 'G', 'H', 'I'], seatsPerRow: 16 },
    { id: 'standing', label: 'Standing', price: 999, color: '#10B981', rows: [], special: true, total: 200 },
]

const SPORTS_SECTIONS = [
    { id: 'north-vip', label: 'North VIP', price: 3500, color: '#F59E0B', arc: 'north', vip: true },
    { id: 'south-vip', label: 'South VIP', price: 3500, color: '#F59E0B', arc: 'south', vip: true },
    { id: 'north', label: 'North Stand', price: 1500, color: '#3B82F6', arc: 'north' },
    { id: 'south', label: 'South Stand', price: 1500, color: '#3B82F6', arc: 'south' },
    { id: 'east', label: 'East Stand', price: 800, color: '#6B7280', arc: 'east' },
    { id: 'west', label: 'West Stand', price: 800, color: '#6B7280', arc: 'west' },
]

const generateSeats = (eventType, bookedIds = [], lockedIds = [], options = {}) => {
    const totalSeats = options.totalSeats || 180
    const seatLayout = options.seatLayout

    const getCinemaCategory = (rowIndex, totalRows) => {
        if (totalRows <= 3) return CINEMA_CATEGORIES[1] // premium fallback
        if (rowIndex < Math.max(2, Math.floor(totalRows * 0.25))) return CINEMA_CATEGORIES[0]
        if (rowIndex < Math.max(4, Math.floor(totalRows * 0.55))) return CINEMA_CATEGORIES[1]
        return CINEMA_CATEGORIES[2]
    }

    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

    const seats = []
    if (eventType === 'movie') {
        // If backend provided a layout JSON array of rows, honor it
        if (seatLayout) {
            try {
                const layout = Array.isArray(seatLayout) ? seatLayout : JSON.parse(seatLayout)
                layout.forEach((rowDef, idx) => {
                    const rowLabel = rowDef.row || alphabet[idx] || `R${idx + 1}`
                    const cat = CINEMA_CATEGORIES.find(c => c.id === rowDef.category) || getCinemaCategory(idx, layout.length)
                    const perRow = rowDef.seatsPerRow || rowDef.count || rowDef.seats?.length || rowDef.seatCount || 12
                    for (let i = 1; i <= perRow; i++) {
                        const id = `${rowLabel}${i}`
                        const isBooked = bookedIds.includes(id)
                        const isLocked = !isBooked && lockedIds.includes(id)
                        seats.push({ id, row: rowLabel, number: i, category: cat.id, price: cat.price, color: cat.color, label: cat.label, status: isBooked ? 'booked' : isLocked ? 'locked' : 'available' })
                        if (seats.length >= totalSeats) break
                    }
                })
            } catch {
                // fallback to dynamic grid
            }
        }

        if (seats.length === 0) {
            const cols = 14
            const totalRows = Math.max(1, Math.ceil(totalSeats / cols))
            for (let r = 0; r < totalRows; r++) {
                const rowLabel = alphabet[r] || `R${r + 1}`
                const cat = getCinemaCategory(r, totalRows)
                for (let c = 1; c <= cols; c++) {
                    const seatNumber = (r * cols) + c
                    if (seatNumber > totalSeats) break
                    const id = `${rowLabel}${c}`
                    const isBooked = bookedIds.includes(id)
                    const isLocked = !isBooked && lockedIds.includes(id)
                    seats.push({ id, row: rowLabel, number: c, category: cat.id, price: cat.price, color: cat.color, label: cat.label, status: isBooked ? 'booked' : isLocked ? 'locked' : 'available' })
                }
            }
        }
    } else if (eventType === 'concert') {
        CONCERT_CATEGORIES.filter(c => !c.special).forEach(cat => {
            cat.rows.forEach(row => {
                for (let i = 1; i <= cat.seatsPerRow; i++) {
                    const id = `${row}${i}`
                    const isBooked = bookedIds.includes(id)
                    const isLocked = !isBooked && lockedIds.includes(id)
                    seats.push({ id, row, number: i, category: cat.id, price: cat.price, color: cat.color, label: cat.label, status: isBooked ? 'booked' : isLocked ? 'locked' : 'available' })
                }
            })
        })
    } else if (eventType === 'sports') {
        SPORTS_SECTIONS.forEach(sec => {
            const rows = sec.vip ? ['V1', 'V2'] : ['A', 'B', 'C', 'D', 'E']
            const seatsPerRow = sec.vip ? 12 : 20
            rows.forEach(row => {
                for (let i = 1; i <= seatsPerRow; i++) {
                    const id = `${sec.id}-${row}${i}`
                    const isBooked = bookedIds.includes(id)
                    const isLocked = !isBooked && lockedIds.includes(id)
                    seats.push({ id, row, number: i, section: sec.id, category: sec.id, price: sec.price, color: sec.color, label: sec.label, status: isBooked ? 'booked' : isLocked ? 'locked' : 'available' })
                }
            })
        })
    }
    return seats
}

function CinemaSeatMap({ seats, selectedSeatIds, onSeatClick, zoom }) {
    const safeSeats = Array.isArray(seats) ? seats : []
    const SEAT_W = 24, SEAT_H = 22, GAP = 6, AISLE_WIDTH = 40
    const rows = {}
    const categoryRows = {}
    safeSeats.forEach(s => {
        if (!rows[s.row]) rows[s.row] = []
        rows[s.row].push(s)
        if (!categoryRows[s.category]) categoryRows[s.category] = new Set()
        categoryRows[s.category].add(s.row)
    })
    const rowKeys = Object.keys(rows).sort()
    if (rowKeys.length === 0) {
        return <div className="text-sm text-muted-color py-12">No seats to display</div>
    }
    const maxCols = Math.max(...Object.values(rows).map(r => r.length))
    const totalW = maxCols * (SEAT_W + GAP) - GAP + AISLE_WIDTH * 2 + 100
    let currentY = 130
    const rowPositions = {}, catPositions = {}
    let currentRowIdx = 0
    CINEMA_CATEGORIES.forEach(cat => {
        const catRows = categoryRows[cat.id] ? Array.from(categoryRows[cat.id]).sort() : []
        if (catRows.length > 0) {
            catPositions[cat.id] = currentY; currentY += 50
            catRows.forEach(row => { rowPositions[row] = currentY - Math.sin((currentRowIdx / rowKeys.length) * Math.PI) * 15; currentY += SEAT_H + GAP; currentRowIdx++ })
            currentY += 20
        }
    })
    const totalH = currentY + 50
    const getSeatFill = (seat) => {
        if (seat.status === 'booked') return '#FF2D5518'
        if (seat.status === 'locked') return '#F59E0B25'
        if (selectedSeatIds.includes(seat.id)) return '#FF2D55'
        return seat.color + '20'
    }
    const getSeatStroke = (seat) => {
        if (seat.status === 'booked') return '#FF2D5570'
        if (seat.status === 'locked') return '#F59E0B'
        if (selectedSeatIds.includes(seat.id)) return '#FF2D55'
        return seat.color + '80'
    }
    const formatPrice = (val) => typeof val === 'number' ? val.toLocaleString('en-IN') : val
    return (
        <svg width={totalW * zoom} height={totalH * zoom} viewBox={`0 0 ${totalW} ${totalH}`} style={{ transition: 'all 0.3s ease-out' }}>
            <defs>
                <linearGradient id="screenGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#FF2D55" stopOpacity="0.1" /><stop offset="50%" stopColor="#FF2D55" stopOpacity="0.8" /><stop offset="100%" stopColor="#FF2D55" stopOpacity="0.1" />
                </linearGradient>
                <filter id="glow"><feGaussianBlur stdDeviation="4" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
            </defs>
            <g transform={`translate(${totalW / 2}, 40)`}>
                <path d={`M -${totalW / 2 - 60} 20 Q 0 -10 ${totalW / 2 - 60} 20`} fill="none" stroke="url(#screenGrad)" strokeWidth="6" filter="url(#glow)" />
                <path d={`M -${totalW / 2 - 60} 20 Q 0 -10 ${totalW / 2 - 60} 20`} fill="none" stroke="#FFFFFF" strokeWidth="2" opacity="0.5" />
                <text x="0" y="45" textAnchor="middle" fill="#94A3B8" fontSize="12" fontWeight="600" letterSpacing="4" fontFamily="Inter">SCREEN THIS WAY</text>
            </g>
            {CINEMA_CATEGORIES.map(cat => {
                const catRows = categoryRows[cat.id] ? Array.from(categoryRows[cat.id]).sort() : []
                if (catRows.length === 0) return null
                return (
                    <g key={`cat-group-${cat.id}`}>
                        <g transform={`translate(0, ${catPositions[cat.id]})`}>
                            <line x1={40} y1={15} x2={totalW / 2 - 80} y2={15} stroke={cat.color} opacity="0.2" strokeWidth="1" strokeDasharray="4 4" />
                            <rect x={totalW / 2 - 70} y={0} width={140} height={30} rx={15} fill={`${cat.color}15`} stroke={`${cat.color}30`} />
                            <text x={totalW / 2} y={19} textAnchor="middle" fill={cat.color} fontSize="11" fontWeight="700" fontFamily="Inter" letterSpacing="1">{cat.label.toUpperCase()} — ₹{formatPrice(cat.price)}</text>
                            <line x1={totalW / 2 + 80} y1={15} x2={totalW - 40} y2={15} stroke={cat.color} opacity="0.2" strokeWidth="1" strokeDasharray="4 4" />
                        </g>
                        {catRows.map(row => {
                            const rowSeats = rows[row], rowY = rowPositions[row]
                            const rowTotalW = rowSeats.length * (SEAT_W + GAP) - GAP + AISLE_WIDTH * 2
                            const startX = (totalW - rowTotalW) / 2
                            return (
                                <g key={row}>
                                    <text x={startX - 25} y={rowY + SEAT_H / 2 + 4} textAnchor="middle" fill="#64748B" fontSize="11" fontWeight="700" fontFamily="Inter">{row}</text>
                                    {rowSeats.map((seat, colIdx) => {
                                        let xOffset = 0
                                        if (colIdx >= 4) xOffset += AISLE_WIDTH
                                        if (colIdx >= rowSeats.length - 4) xOffset += AISLE_WIDTH
                                        const x = startX + colIdx * (SEAT_W + GAP) + xOffset
                                        const isClickable = seat.status === 'available'
                                        const isSelected = selectedSeatIds.includes(seat.id)
                                        const isBooked = seat.status === 'booked'
                                        const isLocked = seat.status === 'locked'
                                        return (
                                            <g key={seat.id} onClick={() => isClickable && onSeatClick(seat)} style={{ cursor: isClickable ? 'pointer' : 'not-allowed' }}>
                                                <path d={`M ${x + 2} ${rowY + 2} Q ${x + SEAT_W / 2} ${rowY - 3} ${x + SEAT_W - 2} ${rowY + 2}`} fill="none" stroke={getSeatStroke(seat)} strokeWidth="2" opacity={isBooked ? 0.5 : 0.8} />
                                                <rect x={x} y={rowY + 3} width={SEAT_W} height={SEAT_H - 3} rx={4} fill={getSeatFill(seat)} stroke={getSeatStroke(seat)} strokeWidth={isSelected ? 2 : 1} filter={isSelected ? 'url(#glow)' : undefined} />
                                                {isBooked && (<><line x1={x + 5} y1={rowY + 6} x2={x + SEAT_W - 5} y2={rowY + SEAT_H - 2} stroke="#FF2D55" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" /><line x1={x + SEAT_W - 5} y1={rowY + 6} x2={x + 5} y2={rowY + SEAT_H - 2} stroke="#FF2D55" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" /></>)}
                                                {isLocked && <circle cx={x + SEAT_W / 2} cy={rowY + SEAT_H / 2 + 2} r="3" fill="#F59E0B" opacity="0.9" />}
                                                {isSelected && <path d={`M ${x + 6} ${rowY + SEAT_H / 2} l 4 4 l 8 -8`} stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />}
                                                {seat.status === 'available' && !isSelected && <text x={x + SEAT_W / 2} y={rowY + SEAT_H / 2 + 2} textAnchor="middle" fill={seat.color} fontSize="8" fontWeight="600" opacity="0.6">{seat.number}</text>}
                                                <title>{`${seat.row}${seat.number} — ${seat.label} — ₹${seat.price} — ${seat.status}`}</title>
                                            </g>
                                        )
                                    })}
                                    <text x={startX + rowTotalW + 25} y={rowY + SEAT_H / 2 + 4} textAnchor="middle" fill="#64748B" fontSize="11" fontWeight="700" fontFamily="Inter">{row}</text>
                                </g>
                            )
                        })}
                    </g>
                )
            })}
        </svg>
    )
}

function ConcertSeatMap({ seats, selectedSeatIds, onSeatClick, zoom }) {
    const SEAT_W = 24, SEAT_H = 22, GAP = 6, AISLE = 50
    const rows = {}
    seats.forEach(s => { if (!rows[s.row]) rows[s.row] = []; rows[s.row].push(s) })
    const rowKeys = Object.keys(rows).sort()
    if (rowKeys.length === 0) {
        return <div className="text-sm text-muted-color py-12">No seats to display</div>
    }
    const maxCols = Math.max(...Object.values(rows).map(r => r.length))
    const totalW = maxCols * (SEAT_W + GAP) - GAP + AISLE + 100
    const totalH = rowKeys.length * (SEAT_H + GAP) + 300
    const getSeatFill = (seat) => {
        if (seat.status === 'booked') return '#FF2D5518'
        if (seat.status === 'locked') return '#F59E0B25'
        if (selectedSeatIds.includes(seat.id)) return seat.color
        return seat.color + '25'
    }
    const getSeatStroke = (seat) => {
        if (seat.status === 'booked') return '#FF2D5570'
        if (seat.status === 'locked') return '#F59E0B'
        if (selectedSeatIds.includes(seat.id)) return seat.color
        return seat.color + '50'
    }
    return (
        <svg width={totalW * zoom} height={totalH * zoom} viewBox={`0 0 ${totalW} ${totalH}`} style={{ transition: 'all 0.3s ease-out' }}>
            <defs>
                <radialGradient id="stageGrad" cx="50%" cy="50%"><stop offset="0%" stopColor="#7C3AED" stopOpacity="0.8" /><stop offset="100%" stopColor="#3B82F6" stopOpacity="0.3" /></radialGradient>
                <filter id="stageGlow"><feGaussianBlur stdDeviation="8" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
            </defs>
            <g transform={`translate(${totalW / 2}, 60)`}>
                <ellipse cx="0" cy="0" rx={120} ry={45} fill="url(#stageGrad)" filter="url(#stageGlow)" />
                <ellipse cx="0" cy="0" rx={120} ry={45} fill="none" stroke="#FFFFFF" strokeWidth="2" opacity="0.4" />
                <path d="M -20 40 L -20 180 L 20 180 L 20 40 Z" fill="url(#stageGrad)" filter="url(#stageGlow)" />
                <path d="M -20 40 L -20 180 L 20 180 L 20 40 Z" fill="none" stroke="#FFFFFF" strokeWidth="1.5" opacity="0.3" />
                <text x="0" y="5" textAnchor="middle" fill="white" fontSize="16" fontWeight="800" letterSpacing="3" fontFamily="Inter">MAIN STAGE</text>
            </g>
            {rowKeys.map((row, rowIdx) => {
                const rowSeats = rows[row], rowY = 220 + rowIdx * (SEAT_H + GAP)
                const rowTotalW = rowSeats.length * (SEAT_W + GAP) - GAP + AISLE
                const startX = (totalW - rowTotalW) / 2
                return (
                    <g key={row}>
                        <text x={startX - 25} y={rowY + SEAT_H / 2 + 4} textAnchor="middle" fill="#64748B" fontSize="11" fontWeight="700" fontFamily="Inter">{row}</text>
                        {rowSeats.map((seat, colIdx) => {
                            let xOffset = 0
                            if (colIdx >= rowSeats.length / 2) xOffset += AISLE
                            const x = startX + colIdx * (SEAT_W + GAP) + xOffset
                            const isClickable = seat.status === 'available'
                            const isSelected = selectedSeatIds.includes(seat.id)
                            const isBooked = seat.status === 'booked'
                            const isLocked = seat.status === 'locked'
                            return (
                                <g key={seat.id} onClick={() => isClickable && onSeatClick(seat)} style={{ cursor: isClickable ? 'pointer' : 'not-allowed' }}>
                                    <circle cx={x + SEAT_W / 2} cy={rowY + SEAT_H / 2} r={SEAT_W / 2 - 1} fill={getSeatFill(seat)} stroke={getSeatStroke(seat)} strokeWidth={isSelected ? 2 : 1} />
                                    {isBooked && (<><line x1={x + 6} y1={rowY + 6} x2={x + SEAT_W - 6} y2={rowY + SEAT_H - 6} stroke="#FF2D55" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" /><line x1={x + SEAT_W - 6} y1={rowY + 6} x2={x + 6} y2={rowY + SEAT_H - 6} stroke="#FF2D55" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" /></>)}
                                    {isLocked && <circle cx={x + SEAT_W / 2} cy={rowY + SEAT_H / 2} r="3" fill="#F59E0B" opacity="0.9" />}
                                    {isSelected && <path d={`M ${x + 5} ${rowY + SEAT_H / 2} l 4 4 l 8 -8`} stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />}
                                    <title>{`${seat.row}${seat.number} — ${seat.label} — ₹${seat.price} — ${seat.status}`}</title>
                                </g>
                            )
                        })}
                        <text x={startX + rowTotalW + 25} y={rowY + SEAT_H / 2 + 4} textAnchor="middle" fill="#64748B" fontSize="11" fontWeight="700" fontFamily="Inter">{row}</text>
                    </g>
                )
            })}
            <g transform={`translate(${totalW / 2}, ${totalH - 60})`}>
                <rect x={-totalW / 2 + 40} y="-25" width={totalW - 80} height={50} rx={12} fill="rgba(16,185,129,0.1)" stroke="rgba(16,185,129,0.3)" strokeWidth="2" strokeDasharray="8,4" />
                <text x="0" y="5" textAnchor="middle" fill="#10B981" fontSize="14" fontWeight="700" fontFamily="Inter">🏃 GENERAL STANDING — ₹999</text>
            </g>
        </svg>
    )
}

function StadiumSeatMap({ selectedSection, onSectionClick }) {
    const cx = 300, cy = 200, W = 600, H = 400
    const getArc = (startZ, endZ, innerR, outerR) => {
        const rad = Math.PI / 180
        const x1 = cx + innerR * Math.cos(startZ * rad), y1 = cy + innerR * Math.sin(startZ * rad)
        const x2 = cx + outerR * Math.cos(startZ * rad), y2 = cy + outerR * Math.sin(startZ * rad)
        const x3 = cx + outerR * Math.cos(endZ * rad), y3 = cy + outerR * Math.sin(endZ * rad)
        const x4 = cx + innerR * Math.cos(endZ * rad), y4 = cy + innerR * Math.sin(endZ * rad)
        const la = endZ - startZ > 180 ? 1 : 0
        return `M ${x1} ${y1} L ${x2} ${y2} A ${outerR} ${outerR} 0 ${la} 1 ${x3} ${y3} L ${x4} ${y4} A ${innerR} ${innerR} 0 ${la} 0 ${x1} ${y1} Z`
    }
    const sections = [
        { id: 'north-vip', label: 'N-VIP', price: '₹3,500', color: '#F59E0B', d: getArc(-125, -55, 105, 130) },
        { id: 'south-vip', label: 'S-VIP', price: '₹3,500', color: '#F59E0B', d: getArc(55, 125, 105, 130) },
        { id: 'north', label: 'North', price: '₹1,500', color: '#3B82F6', d: getArc(-135, -45, 135, 180) },
        { id: 'south', label: 'South', price: '₹1,500', color: '#3B82F6', d: getArc(45, 135, 135, 180) },
        { id: 'east', label: 'East', price: '₹800', color: '#6B7280', d: getArc(-42, 42, 105, 180) },
        { id: 'west', label: 'West', price: '₹800', color: '#6B7280', d: getArc(138, 222, 105, 180) },
    ]
    return (
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="max-w-full" style={{ transform: 'perspective(800px) rotateX(45deg) rotateZ(-15deg)' }}>
            <defs>
                <radialGradient id="pitchGrad" cx="50%" cy="50%"><stop offset="0%" stopColor="#15803D" /><stop offset="50%" stopColor="#16A34A" /><stop offset="100%" stopColor="#15803D" /></radialGradient>
                <filter id="sectionGlow"><feGaussianBlur stdDeviation="4" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
            </defs>
            <ellipse cx={cx + 20} cy={cy + 20} rx={185} ry={185} fill="rgba(0,0,0,0.5)" filter="url(#sectionGlow)" />
            <ellipse cx={cx} cy={cy} rx={185} ry={185} fill="#0F172A" stroke="#334155" strokeWidth="4" />
            <ellipse cx={cx} cy={cy} rx={95} ry={95} fill="url(#pitchGrad)" stroke="#FFFFFF" strokeOpacity="0.5" strokeWidth="2" />
            {[...Array(6)].map((_, i) => <ellipse key={i} cx={cx} cy={cy} rx={15 + i * 14} ry={15 + i * 14} fill="none" stroke={i % 2 === 0 ? 'rgba(255,255,255,0.05)' : 'transparent'} strokeWidth="13" />)}
            <ellipse cx={cx} cy={cy} rx={25} ry={25} fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2" />
            <line x1={cx} y1={cy - 90} x2={cx} y2={cy + 90} stroke="rgba(255,255,255,0.6)" strokeWidth="2" />
            <circle cx={cx} cy={cy} r="3" fill="#FFFFFF" />
            {sections.map(s => {
                const isSel = selectedSection === s.id
                return (
                    <g key={s.id} onClick={() => onSectionClick(s)} style={{ cursor: 'pointer' }}>
                        {!isSel && <path d={s.d} fill="#000" opacity="0.3" transform="translate(4,4)" />}
                        <path d={s.d} fill={isSel ? s.color : s.color + '60'} stroke={isSel ? '#FFFFFF' : s.color} strokeWidth={isSel ? 3 : 1.5} filter={isSel ? 'url(#sectionGlow)' : undefined} style={{ transform: isSel ? 'translate(-8px, -8px)' : 'none', transition: 'transform 0.2s ease-out' }} />
                        <title>{`${s.label} — ${s.price}`}</title>
                    </g>
                )
            })}
            <g style={{ transform: 'rotateZ(15deg) rotateX(-45deg)', transformOrigin: `${cx}px ${cy}px` }}>
                <text x={cx} y={cy - 110} textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="800" fontFamily="Inter">NORTH VIP</text>
                <text x={cx} y={cy - 152} textAnchor="middle" fill="#FFFFFF" fontSize="13" fontWeight="800" fontFamily="Inter">NORTH STAND</text>
                <text x={cx} y={cy + 115} textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="800" fontFamily="Inter">SOUTH VIP</text>
                <text x={cx} y={cy + 160} textAnchor="middle" fill="#FFFFFF" fontSize="13" fontWeight="800" fontFamily="Inter">SOUTH STAND</text>
                <text x={cx + 150} y={cy + 5} textAnchor="middle" fill="#FFFFFF" fontSize="13" fontWeight="800" fontFamily="Inter">EAST</text>
                <text x={cx - 150} y={cy + 5} textAnchor="middle" fill="#FFFFFF" fontSize="13" fontWeight="800" fontFamily="Inter">WEST</text>
            </g>
        </svg>
    )
}

function SectionSeatMap({ sectionId, seats, selectedSeatIds, onSeatClick }) {
    const SEAT_W = 24, SEAT_H = 24, GAP = 8
    const rows = {}
    seats.forEach(s => { if (!rows[s.row]) rows[s.row] = []; rows[s.row].push(s) })
    const rowKeys = Object.keys(rows).sort()
    if (rowKeys.length === 0) {
        return <div className="text-sm text-muted-color py-12 text-center">No seats available for this section</div>
    }
    const maxCols = Math.max(...Object.values(rows).map(r => r.length))
    const totalW = maxCols * (SEAT_W + GAP) + 100
    const totalH = rowKeys.length * (SEAT_H + GAP) + 80
    const color = seats[0]?.color || '#3B82F6'
    return (
        <svg width="100%" height="auto" viewBox={`0 0 ${totalW} ${totalH}`}>
            <defs><filter id="seatGlow"><feGaussianBlur stdDeviation="3" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter></defs>
            <path d={`M ${totalW / 2 - 40} 20 Q ${totalW / 2} 5 ${totalW / 2 + 40} 20`} fill="none" stroke="#64748B" strokeWidth="2" strokeDasharray="4 4" />
            <text x={totalW / 2} y="35" textAnchor="middle" fill="#64748B" fontSize="11" fontWeight="700" fontFamily="Inter" letterSpacing="2">PITCH DIRECTION</text>
            {rowKeys.map((row, rowIdx) => {
                const rowSeats = rows[row], rowY = 70 + rowIdx * (SEAT_H + GAP)
                const startX = (totalW - (rowSeats.length * (SEAT_W + GAP))) / 2
                return (
                    <g key={row}>
                        <text x={startX - 20} y={rowY + SEAT_H / 2 + 4} textAnchor="middle" fill="#64748B" fontSize="11" fontWeight="700" fontFamily="Inter">{row}</text>
                        {rowSeats.map((seat, colIdx) => {
                            const x = startX + colIdx * (SEAT_W + GAP)
                            const isSelected = selectedSeatIds.includes(seat.id)
                            const isAvailable = seat.status === 'available'
                            const isBooked = seat.status === 'booked'
                            const isLocked = seat.status === 'locked'
                            const bg = isBooked ? '#FF2D5518' : isLocked ? '#F59E0B25' : isSelected ? color : color + '20'
                            const stroke = isBooked ? '#FF2D5570' : isLocked ? '#F59E0B' : isSelected ? '#FFFFFF' : color + '80'
                            return (
                                <g key={seat.id} onClick={() => isAvailable && onSeatClick(seat)} style={{ cursor: isAvailable ? 'pointer' : 'not-allowed' }}>
                                    <path d={`M ${x + 3} ${rowY + 2} L ${x + SEAT_W - 3} ${rowY + 2} Q ${x + SEAT_W} ${rowY + 2} ${x + SEAT_W} ${rowY + 8} L ${x} ${rowY + 8} Q ${x} ${rowY + 2} ${x + 3} ${rowY + 2}`} fill={stroke} opacity="0.5" />
                                    <rect x={x} y={rowY + 8} width={SEAT_W} height={SEAT_H - 8} rx={4} fill={bg} stroke={stroke} strokeWidth={isSelected ? 2 : 1.5} filter={isSelected ? 'url(#seatGlow)' : undefined} />
                                    {isBooked && (<><line x1={x + 4} y1={rowY + 10} x2={x + SEAT_W - 4} y2={rowY + SEAT_H} stroke="#FF2D55" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" /><line x1={x + SEAT_W - 4} y1={rowY + 10} x2={x + 4} y2={rowY + SEAT_H} stroke="#FF2D55" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" /></>)}
                                    {isLocked && <circle cx={x + SEAT_W / 2} cy={rowY + 16} r="3" fill="#F59E0B" opacity="0.9" />}
                                    {isSelected && <path d={`M ${x + 6} ${rowY + 14} l 4 4 l 8 -8`} stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />}
                                    {isAvailable && !isSelected && <text x={x + SEAT_W / 2} y={rowY + 18} textAnchor="middle" fill={color} fontSize="8" fontWeight="700" opacity="0.8">{seat.number}</text>}
                                    <title>{`${seat.row}${seat.number} — ${seat.label} — ₹${seat.price} — ${seat.status}`}</title>
                                </g>
                            )
                        })}
                        <text x={startX + rowSeats.length * (SEAT_W + GAP) + 15} y={rowY + SEAT_H / 2 + 4} textAnchor="middle" fill="#64748B" fontSize="11" fontWeight="700" fontFamily="Inter">{row}</text>
                    </g>
                )
            })}
        </svg>
    )
}

function SeatLegend() {
    const items = [
        { color: '#3B82F6', label: 'Available', type: 'available' },
        { color: '#FF2D55', label: 'Selected', type: 'selected' },
        { color: '#F59E0B', label: 'Locked (5 min)', type: 'locked' },
        { color: '#FF2D55', label: 'Booked', type: 'booked' },
    ]
    return (
        <div className="flex flex-wrap items-center gap-4 justify-center">
            {items.map(item => (
                <div key={item.label} className="flex items-center gap-2">
                    <div className="w-6 h-5 rounded relative overflow-hidden flex items-center justify-center"
                        style={{
                            background: item.type === 'booked' ? '#FF2D5518' : item.type === 'locked' ? '#F59E0B25' : item.type === 'selected' ? item.color : item.color + '20',
                            border: `1.5px solid ${item.type === 'locked' ? '#F59E0B' : item.color + (item.type === 'booked' ? '70' : item.type === 'available' ? '80' : '')}`,
                        }}>
                        {item.type === 'booked' && <svg width="14" height="12" viewBox="0 0 14 12"><line x1="2" y1="2" x2="12" y2="10" stroke="#FF2D55" strokeWidth="2" strokeLinecap="round" opacity="0.8" /><line x1="12" y1="2" x2="2" y2="10" stroke="#FF2D55" strokeWidth="2" strokeLinecap="round" opacity="0.8" /></svg>}
                        {item.type === 'locked' && <div className="w-2 h-2 rounded-full" style={{ background: '#F59E0B' }} />}
                        {item.type === 'selected' && <svg width="14" height="12" viewBox="0 0 14 12"><path d="M2 6 l4 4 l6 -8" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                    </div>
                    <span className="text-xs text-muted-color">{item.label}</span>
                </div>
            ))}
        </div>
    )
}

export default function SeatSelectionPage() {
    const { showtimeId } = useParams()
    const navigate = useNavigate()
    const location = useLocation()
    const passedState = location.state || {}
    const { selectedSeats, selectSeat, clearSeats, totalAmount, subtotal, gst, convenience, setShowtimeInfo: saveShowtimeInfo } = useBookingStore()

    const [loading, setLoading] = useState(true)
    const [seats, setSeats] = useState([])
    const [eventType, setEventType] = useState('movie')
    const [showtimeInfo, setShowtimeInfo] = useState(null)
    const [zoom, setZoom] = useState(1)
    const [lockTimer, setLockTimer] = useState(null)
    const [lockSeconds, setLockSeconds] = useState(0)
    const [selectedSection, setSelectedSection] = useState(null)
    const timerRef = useRef(null)

    // ✅ Excludes your own seats from being shown as yellow/locked
    const isGuidLike = useCallback((val) => /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(val || ''), [])

    const eventId = useMemo(
        () => (isGuidLike(passedState.eventId) ? passedState.eventId : showtimeInfo?.eventId || null),
        [passedState.eventId, showtimeInfo?.eventId, isGuidLike]
    )

    const hasToken = useMemo(
        () => !!(sessionStorage.getItem('bs_token') || localStorage.getItem('bs_token')),
        []
    )

    const serverLockingEnabled = useMemo(
        () => hasToken && eventType === 'movie' && isGuidLike(showtimeId),
        [hasToken, eventType, isGuidLike, showtimeId]
    )

    const eventLockingEnabled = useMemo(
        () => hasToken && eventType !== 'movie' && isGuidLike(eventId),
        [hasToken, eventType, isGuidLike, eventId]
    )

    const resolvedShowTimeId = useMemo(
        () => (isGuidLike(showtimeId) ? showtimeId : null),
        [isGuidLike, showtimeId]
    )

    const refreshSeats = useCallback(async (currentEventType, currentSelectedIds = []) => {
        if (!serverLockingEnabled && !eventLockingEnabled) {
            setSeats(generateSeats(currentEventType, [], [], { totalSeats: showtimeInfo?.totalSeats }))
            return
        }

        try {
            if (serverLockingEnabled) {
                const { data } = await seatsApi.getStatus(showtimeId)
                const bookedIds = data.seats.filter(s => s.status === 'booked').map(s => s.seatId)
                const lockedIds = data.seats
                    .filter(s => s.status === 'locked')
                    .map(s => s.seatId)
                    .filter(id => !currentSelectedIds.includes(id))
                const totalSeats = data?.totalSeats || showtimeInfo?.totalSeats
                const seatLayout = data?.seatLayout
                setSeats(generateSeats(currentEventType, bookedIds, lockedIds, { totalSeats, seatLayout }))
            } else if (eventLockingEnabled && eventId) {
                const { data } = await eventSeatsApi.getStatus(eventId)
                const bookedIds = data.seats.filter(s => s.status === 'booked').map(s => s.seatId)
                const lockedIds = data.seats
                    .filter(s => s.status === 'locked')
                    .map(s => s.seatId)
                    .filter(id => !currentSelectedIds.includes(id))
                setSeats(generateSeats(currentEventType, bookedIds, lockedIds, { totalSeats: showtimeInfo?.totalSeats }))
            }
        } catch (e) {
            console.warn('Refresh failed', e)
            setSeats(generateSeats(currentEventType, [], [], { totalSeats: showtimeInfo?.totalSeats }))
        }
    }, [serverLockingEnabled, eventLockingEnabled, showtimeId, eventId, showtimeInfo?.totalSeats])

    useEffect(() => {
        setLoading(true)

        const resolvedType = ['movie', 'concert', 'sports'].includes(passedState.eventType) ? passedState.eventType : 'movie'
        setEventType(resolvedType)

        const info = {
            eventName: passedState.eventName || 'Your Event',
            venue: passedState.venue || '',
            date: passedState.date || '',
            time: passedState.time || '',
            language: passedState.language || (resolvedType === 'movie' ? 'English' : null),
            eventType: resolvedType,
            showtimeId: isGuidLike(passedState.showTimeId) ? passedState.showTimeId : resolvedShowTimeId,
            showTimeId: isGuidLike(passedState.showTimeId) ? passedState.showTimeId : resolvedShowTimeId,
            movieId: passedState.movieId || null,
            eventId: isGuidLike(passedState.eventId) ? passedState.eventId : null,
            venueCity: passedState.venueCity || '',
            totalSeats: passedState.totalSeats || null,
        }
        setShowtimeInfo(info)
        saveShowtimeInfo(info)

        // ✅ Unlock leftover locks from previous session then clear store
        const prevSeats = useBookingStore.getState().selectedSeats
        if (serverLockingEnabled && prevSeats.length > 0) {
            seatsApi.unlock(showtimeId, prevSeats.map(s => s.id)).catch(() => {})
        } else if (eventLockingEnabled && eventId && prevSeats.length > 0) {
            eventSeatsApi.unlock(eventId, prevSeats.map(s => s.id)).catch(() => {})
        }
        clearSeats()

        if (serverLockingEnabled) {
            seatsApi.getStatus(showtimeId)
                .then(({ data }) => {
                    const bookedIds = data.seats.filter(s => s.status === 'booked').map(s => s.seatId)
                    const lockedIds = data.seats.filter(s => s.status === 'locked').map(s => s.seatId)
                    setShowtimeInfo(prev => ({ ...prev, totalSeats: data.totalSeats || prev?.totalSeats, seatLayout: data.seatLayout || prev?.seatLayout }))
                    setSeats(generateSeats(resolvedType, bookedIds, lockedIds, { totalSeats: data.totalSeats || prev?.totalSeats, seatLayout: data.seatLayout }))
                })
                .catch(() => setSeats(generateSeats(resolvedType, [], [], { totalSeats: info.totalSeats })))
                .finally(() => setLoading(false))
        }
        else if (eventLockingEnabled && eventId) {
            eventSeatsApi.getStatus(eventId)
                .then(({ data }) => {
                    const bookedIds = data.seats.filter(s => s.status === 'booked').map(s => s.seatId)
                    const lockedIds = data.seats.filter(s => s.status === 'locked').map(s => s.seatId)
                    setSeats(generateSeats(resolvedType, bookedIds, lockedIds, { totalSeats: info.totalSeats }))
                })
                .catch(() => setSeats(generateSeats(resolvedType, [], [], { totalSeats: info.totalSeats })))
                .finally(() => setLoading(false))
        }
        else {
            setSeats(generateSeats(resolvedType, [], [], { totalSeats: info.totalSeats }))
            setLoading(false)
        }
    }, [showtimeId, serverLockingEnabled, eventLockingEnabled, eventId, passedState.eventType, passedState.eventName, passedState.venue, passedState.date, passedState.time, passedState.language, passedState.showTimeId, passedState.movieId, passedState.eventId, passedState.venueCity, passedState.totalSeats, resolvedShowTimeId, isGuidLike])

    useEffect(() => {
        if (selectedSeats.length > 0 && !lockTimer) {
            setLockTimer(Date.now() + 5 * 60 * 1000)
            setLockSeconds(300)
        }
        if (selectedSeats.length === 0) {
            setLockTimer(null); setLockSeconds(0)
            if (timerRef.current) clearInterval(timerRef.current)
        }
    }, [selectedSeats.length])

    useEffect(() => {
        if (lockTimer) {
            timerRef.current = setInterval(() => {
                const remaining = Math.max(0, Math.round((lockTimer - Date.now()) / 1000))
                setLockSeconds(remaining)
                if (remaining === 0) {
                    clearInterval(timerRef.current)
                    clearSeats()
                    toast.error('Seat lock expired. Please re-select your seats.')
                    setLockTimer(null)
                }
            }, 1000)
        }
        return () => { if (timerRef.current) clearInterval(timerRef.current) }
    }, [lockTimer])

    // ✅ Sends ALL seats in one lock request — prevents backend from deleting previous locks
    const handleSeatClick = useCallback(async (seat) => {
        if (seat.status !== 'available') return

        const isAlreadySelected = selectedSeats.find(s => s.id === seat.id)
        const newSelectedIds = isAlreadySelected
            ? selectedSeats.filter(s => s.id !== seat.id).map(s => s.id)
            : [...selectedSeats.map(s => s.id), seat.id]

        // For events/sports/concerts we keep selection client-side without hitting the seat-lock API
        if (!serverLockingEnabled && !eventLockingEnabled) {
            selectSeat(seat)
            setSeats(prev => prev.map(s => s.id === seat.id ? { ...s, status: isAlreadySelected ? 'available' : s.status } : s))
            return
        }

        try {
            if (serverLockingEnabled) {
                if (selectedSeats.length > 0) {
                    await seatsApi.unlock(showtimeId, selectedSeats.map(s => s.id))
                }
                if (newSelectedIds.length > 0) {
                    await seatsApi.lock(showtimeId, newSelectedIds)
                }
            }
            else if (eventLockingEnabled && eventId) {
                if (selectedSeats.length > 0) {
                    await eventSeatsApi.unlock(eventId, selectedSeats.map(s => s.id))
                }
                if (newSelectedIds.length > 0) {
                    await eventSeatsApi.lock(eventId, newSelectedIds)
                }
            }
            selectSeat(seat)
            await refreshSeats(eventType, newSelectedIds)
        } catch (err) {
            if (err?.response?.status === 401) {
                toast.error('Please log in to lock seats')
                navigate('/login', { state: { from: location.pathname } })
                return
            }
            const taken = err?.response?.data?.takenSeats
            toast.error(taken?.length ? `Seat ${taken.join(', ')} just taken by someone else!` : 'Could not lock seat. Please try again.')
            await refreshSeats(eventType, selectedSeats.map(s => s.id))
        }
    }, [selectedSeats, showtimeId, selectSeat, refreshSeats, eventType, serverLockingEnabled, eventLockingEnabled, eventId, navigate, location.pathname])

    const handleProceed = () => {
        if (selectedSeats.length === 0) { toast.error('Please select at least one seat!'); return }
        navigate('/checkout')
    }

    const formatTime = (s) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`
    const selectedSeatIds = selectedSeats.map(s => s.id)

    if (loading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
                <div className="w-12 h-12 border-4 border-red-500/30 border-t-red-500 rounded-full animate-spin" />
                <p className="text-muted-color text-sm">Loading seating layout...</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
            <div className="sticky top-16 z-30 border-b border-default" style={{ background: 'var(--nav-bg)', backdropFilter: 'blur(20px)' }}>
                <div className="max-w-7xl mx-auto px-4 py-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                            <h1 className="font-black text-lg text-primary-color font-display">{showtimeInfo?.eventName}</h1>
                            <p className="text-xs text-muted-color">{showtimeInfo?.venue} · {showtimeInfo?.date} · {showtimeInfo?.time}{showtimeInfo?.language ? ` · ${showtimeInfo.language}` : ''}</p>
                        </div>
                        {lockSeconds > 0 && (
                            <div className="flex items-center gap-2 px-4 py-2 rounded-xl border" style={{ background: 'rgba(245,158,11,0.1)', borderColor: 'rgba(245,158,11,0.3)' }}>
                                <Clock className="w-4 h-4 text-yellow-400" />
                                <span className="text-sm font-bold text-yellow-400">{formatTime(lockSeconds)}</span>
                                <span className="text-xs text-yellow-500">seat hold</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-6">
                <div className="flex flex-col xl:flex-row gap-6">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2 text-sm text-muted-color"><Wifi className="w-4 h-4 text-green-400" /><span>Live seat availability</span></div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => setZoom(z => Math.max(0.6, z - 0.1))} className="btn-icon w-8 h-8"><ZoomOut className="w-4 h-4" /></button>
                                <span className="text-xs text-muted-color w-8 text-center">{Math.round(zoom * 100)}%</span>
                                <button onClick={() => setZoom(z => Math.min(1.5, z + 0.1))} className="btn-icon w-8 h-8"><ZoomIn className="w-4 h-4" /></button>
                                <button onClick={() => setZoom(1)} className="btn-icon w-8 h-8"><RotateCcw className="w-4 h-4" /></button>
                            </div>
                        </div>
                        <div className="rounded-2xl p-4 overflow-auto text-center border border-default" style={{ background: '#0D1117' }}>
                            {eventType === 'movie' && <CinemaSeatMap seats={seats} selectedSeatIds={selectedSeatIds} onSeatClick={handleSeatClick} zoom={zoom} />}
                            {eventType === 'concert' && <ConcertSeatMap seats={seats} selectedSeatIds={selectedSeatIds} onSeatClick={handleSeatClick} zoom={zoom} />}
                            {eventType === 'sports' && (
                                <div className="flex flex-col items-center gap-4">
                                    {!selectedSection ? (
                                        <div className="flex flex-col items-center">
                                            <StadiumSeatMap selectedSection={selectedSection} onSectionClick={(s) => setSelectedSection(s.id)} />
                                            <p className="text-sm text-muted-color mt-4 bg-white/5 px-4 py-2 rounded-full backdrop-blur-md border border-white/10">👆 Select a stadium section to view available seats</p>
                                        </div>
                                    ) : (
                                        <div className="w-full flex flex-col items-center py-4">
                                            <div className="flex justify-between w-full mb-6 px-4">
                                                <button onClick={() => setSelectedSection(null)} className="flex items-center gap-2 text-sm text-muted-color hover:text-white transition-colors"><RotateCcw className="w-4 h-4" /> Back to Stadium</button>
                                                <div className="text-right">
                                                    <h3 className="font-bold text-lg" style={{ color: SPORTS_SECTIONS.find(s => s.id === selectedSection)?.color }}>{SPORTS_SECTIONS.find(s => s.id === selectedSection)?.label} Stand</h3>
                                                    <p className="text-xs text-muted-color">₹{SPORTS_SECTIONS.find(s => s.id === selectedSection)?.price} per seat</p>
                                                </div>
                                            </div>
                                            <div className="w-full max-w-2xl bg-[#0D1117] px-4 py-12 rounded-3xl border border-white/5 relative overflow-hidden" style={{ boxShadow: 'inset 0 0 40px rgba(0,0,0,0.5)' }}>
                                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1/2 opacity-20 pointer-events-none" style={{ background: `radial-gradient(ellipse at top, ${SPORTS_SECTIONS.find(s => s.id === selectedSection)?.color}, transparent 70%)` }} />
                                                <SectionSeatMap sectionId={selectedSection} seats={seats.filter(s => s.section === selectedSection)} selectedSeatIds={selectedSeatIds} onSeatClick={handleSeatClick} />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        <div className="mt-4 p-4 rounded-xl border border-default" style={{ background: 'var(--card-bg)' }}><SeatLegend /></div>
                        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {(eventType === 'movie' ? CINEMA_CATEGORIES : eventType === 'concert' ? CONCERT_CATEGORIES : SPORTS_SECTIONS.slice(0, 6)).map(cat => (
                                <div key={cat.id} className="flex items-center gap-3 p-3 rounded-xl border border-default" style={{ background: 'var(--card-bg)' }}>
                                    <div className="w-4 h-4 rounded flex-shrink-0" style={{ background: cat.color }} />
                                    <div><p className="text-xs font-semibold text-primary-color">{cat.label}</p><p className="text-xs text-muted-color">₹{cat.price}</p></div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="xl:w-80 flex-shrink-0">
                        <div className="sticky top-36 rounded-2xl border border-default overflow-hidden" style={{ background: 'var(--card-bg)' }}>
                            <div className="p-5 border-b border-default" style={{ background: 'linear-gradient(135deg, rgba(255,45,85,0.07), rgba(255,107,53,0.04))' }}>
                                <h3 className="font-bold text-primary-color mb-1">Booking Summary</h3>
                                <div className="flex items-center gap-2 text-sm text-muted-color"><Users className="w-4 h-4" /><span>{selectedSeats.length} seat{selectedSeats.length !== 1 ? 's' : ''} selected</span></div>
                            </div>
                            <div className="p-5">
                                {selectedSeats.length > 0 ? (
                                    <div className="mb-5">
                                        <h4 className="text-sm font-semibold text-primary-color mb-3">Selected Seats</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedSeats.map(seat => (
                                                <div key={seat.id} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border" style={{ background: seat.color + '20', borderColor: seat.color + '60', color: seat.color }}>
                                                    <span>{seat.id}</span>
                                                    <button onClick={() => handleSeatClick(seat)} className="ml-1 opacity-60 hover:opacity-100">×</button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <div className="text-4xl mb-3">🎭</div>
                                        <p className="text-sm text-muted-color">No seats selected yet</p>
                                        <p className="text-xs text-muted-color mt-1">Click on available seats to select them</p>
                                    </div>
                                )}
                                {selectedSeats.length > 0 && (
                                    <div className="space-y-3 mb-5">
                                        <div className="flex justify-between text-sm"><span className="text-muted-color">Subtotal ({selectedSeats.length} seats)</span><span className="font-medium text-primary-color">₹{subtotal || selectedSeats.reduce((s, seat) => s + seat.price, 0)}</span></div>
                                        <div className="flex justify-between text-sm"><span className="text-muted-color">Convenience Fee</span><span className="font-medium text-primary-color">₹{convenience || Math.round(selectedSeats.reduce((s, seat) => s + seat.price, 0) * 0.05)}</span></div>
                                        <div className="flex justify-between text-sm"><span className="text-muted-color">GST (18%)</span><span className="font-medium text-primary-color">₹{gst || Math.round(selectedSeats.reduce((s, seat) => s + seat.price, 0) * 0.18)}</span></div>
                                        <div className="h-px" style={{ background: 'var(--border-color)' }} />
                                        <div className="flex justify-between text-base font-bold"><span className="text-primary-color">Total Payable</span><span className="text-gradient">₹{totalAmount || Math.round(selectedSeats.reduce((s, seat) => s + seat.price, 0) * 1.23)}</span></div>
                                    </div>
                                )}
                                <button onClick={handleProceed} id="seat-proceed-btn" disabled={selectedSeats.length === 0} className="btn-primary w-full py-4">
                                    {selectedSeats.length === 0 ? 'Select Seats to Continue' : `Proceed to Pay ₹${totalAmount || Math.round(selectedSeats.reduce((s, seat) => s + seat.price, 0) * 1.23)}`}
                                    {selectedSeats.length > 0 && <ArrowRight className="w-5 h-5" />}
                                </button>
                                <div className="flex items-start gap-2 mt-4 p-3 rounded-xl" style={{ background: 'rgba(59,130,246,0.07)' }}>
                                    <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                                    <p className="text-xs text-blue-400">Seats are held for 5 minutes once selected. Complete payment to confirm.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}