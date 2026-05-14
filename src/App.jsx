// Maya's Coaching Command Center — Prototype
// Spec: prototype-build-spec.md

import React, { useState, useMemo } from 'react';
import { Play, Users, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, ReferenceLine } from 'recharts';

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const CPS_THRESHOLD = 75;

const ISSUE_COLORS = {
  knowledge:    { bg: 'bg-blue-100',    text: 'text-blue-800',    pill: 'bg-blue-100 text-blue-800'    },
  onboarding:   { bg: 'bg-purple-100',  text: 'text-purple-800',  pill: 'bg-purple-100 text-purple-800'  },
  logistics:    { bg: 'bg-orange-100',  text: 'text-orange-800',  pill: 'bg-orange-100 text-orange-800'  },
  personal:     { bg: 'bg-rose-100',    text: 'text-rose-800',    pill: 'bg-rose-100 text-rose-800'    },
  policy:       { bg: 'bg-red-100',     text: 'text-red-800',     pill: 'bg-red-100 text-red-800'     },
  motivational: { bg: 'bg-yellow-100',  text: 'text-yellow-800',  pill: 'bg-yellow-100 text-yellow-800'  },
  none:         { bg: 'bg-gray-100',    text: 'text-gray-600',    pill: 'bg-gray-100 text-gray-600'    },
};

const ROUTE_LABELS = {
  automated_coaching: 'Automated Coaching',
  supervisor_direct:  'Supervisor Direct',
  ops_escalation:     'Ops Escalation',
};

const ROUTE_COLORS = {
  automated_coaching: 'bg-green-100 text-green-800',
  supervisor_direct:  'bg-rose-100 text-rose-800',
  ops_escalation:     'bg-orange-100 text-orange-800',
};

// ─── SEED DATA ────────────────────────────────────────────────────────────────

const D = (n) => {
  const d = new Date('2026-04-16');
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
};

const AGENTS = [
  // ── ABOVE THRESHOLD A001–A032 (CPS 76–98, latent_issue_type: "none") ──────

  { id:'A001', name:'Maria Santos', tenure_months:36, cps:92, cps_threshold:75, cps_trend_7d:[90,91,92,91,93,92,92], metrics:{csat:94,fcr:89,aht_seconds:245,escalation_rate:3,compliance_score:97,call_quality:91}, recent_calls:[{call_id:'C1001',date:D(2),duration_seconds:240,intent:'billing dispute',outcome:'resolved',transcript_excerpt:'Agent: I understand your concern — let me pull up your account. I can see exactly what happened and I\'ll get this sorted for you today. Customer: Thank you so much.',flags:[]}], latent_issue_type:'none', latent_issue_evidence:[]},
  { id:'A002', name:'James Okafor', tenure_months:28, cps:88, cps_threshold:75, cps_trend_7d:[87,88,86,89,88,87,88], metrics:{csat:91,fcr:85,aht_seconds:278,escalation_rate:4,compliance_score:95,call_quality:88}, recent_calls:[{call_id:'C1002',date:D(1),duration_seconds:265,intent:'plan upgrade',outcome:'resolved',transcript_excerpt:'Agent: Based on your usage, the Premium plan would actually save you money. Let me explain why. Customer: That makes sense, let\'s do it.',flags:[]}], latent_issue_type:'none', latent_issue_evidence:[]},
  { id:'A003', name:'Linda Park', tenure_months:42, cps:95, cps_threshold:75, cps_trend_7d:[94,95,96,95,94,95,95], metrics:{csat:97,fcr:93,aht_seconds:220,escalation_rate:2,compliance_score:98,call_quality:95}, recent_calls:[{call_id:'C1003',date:D(1),duration_seconds:215,intent:'account inquiry',outcome:'resolved',transcript_excerpt:'Agent: Your account is in perfect standing. Anything else I can clarify? Customer: No, that\'s exactly what I needed.',flags:[]}], latent_issue_type:'none', latent_issue_evidence:[]},
  { id:'A004', name:'Derek Williams', tenure_months:19, cps:79, cps_threshold:75, cps_trend_7d:[78,79,78,80,79,79,79], metrics:{csat:82,fcr:78,aht_seconds:310,escalation_rate:6,compliance_score:88,call_quality:80}, recent_calls:[{call_id:'C1004',date:D(3),duration_seconds:305,intent:'cancellation',outcome:'resolved',transcript_excerpt:'Agent: Let me see what options we have to keep your service at a price that works for you. Customer: Okay, I\'m listening.',flags:[]}], latent_issue_type:'none', latent_issue_evidence:[]},
  { id:'A005', name:'Aisha Patel', tenure_months:31, cps:87, cps_threshold:75, cps_trend_7d:[86,87,88,87,86,87,87], metrics:{csat:90,fcr:84,aht_seconds:252,escalation_rate:4,compliance_score:93,call_quality:87}, recent_calls:[{call_id:'C1005',date:D(2),duration_seconds:248,intent:'technical support',outcome:'resolved',transcript_excerpt:'Agent: Try restarting while I stay on the line. Customer: Oh — it\'s working now! Agent: Perfect.',flags:[]}], latent_issue_type:'none', latent_issue_evidence:[]},
  { id:'A006', name:'Tom Reyes', tenure_months:24, cps:83, cps_threshold:75, cps_trend_7d:[82,83,84,83,82,83,83], metrics:{csat:86,fcr:80,aht_seconds:285,escalation_rate:5,compliance_score:90,call_quality:83}, recent_calls:[{call_id:'C1006',date:D(2),duration_seconds:280,intent:'refund request',outcome:'resolved',transcript_excerpt:'Agent: I\'ve confirmed refund eligibility and I\'ll process that now — 3–5 business days. Customer: Thank you.',flags:[]}], latent_issue_type:'none', latent_issue_evidence:[]},
  { id:'A007', name:'Naomi Chen', tenure_months:15, cps:77, cps_threshold:75, cps_trend_7d:[76,77,77,78,76,77,77], metrics:{csat:80,fcr:75,aht_seconds:320,escalation_rate:7,compliance_score:85,call_quality:78}, recent_calls:[{call_id:'C1007',date:D(4),duration_seconds:318,intent:'service complaint',outcome:'resolved',transcript_excerpt:'Agent: I sincerely apologize — that\'s not our standard. Let me escalate this properly. Customer: I appreciate you taking it seriously.',flags:[]}], latent_issue_type:'none', latent_issue_evidence:[]},
  { id:'A008', name:'Carlos Mendez', tenure_months:48, cps:96, cps_threshold:75, cps_trend_7d:[95,96,97,96,95,96,96], metrics:{csat:98,fcr:94,aht_seconds:210,escalation_rate:1,compliance_score:99,call_quality:96}, recent_calls:[{call_id:'C1008',date:D(1),duration_seconds:208,intent:'payment inquiry',outcome:'resolved',transcript_excerpt:'Agent: Payment posted successfully on the 14th — you\'re all set. Customer: Perfect, thank you.',flags:[]}], latent_issue_type:'none', latent_issue_evidence:[]},
  { id:'A009', name:'Sarah Kim', tenure_months:22, cps:85, cps_threshold:75, cps_trend_7d:[84,85,86,85,84,85,85], metrics:{csat:88,fcr:82,aht_seconds:268,escalation_rate:5,compliance_score:91,call_quality:85}, recent_calls:[{call_id:'C1009',date:D(2),duration_seconds:262,intent:'product information',outcome:'resolved',transcript_excerpt:'Agent: I\'ll send a comparison chart now so you can see exactly what\'s included at each tier. Customer: That\'s really helpful.',flags:[]}], latent_issue_type:'none', latent_issue_evidence:[]},
  { id:'A010', name:'Marcus Johnson', tenure_months:33, cps:90, cps_threshold:75, cps_trend_7d:[89,90,91,90,89,90,90], metrics:{csat:93,fcr:87,aht_seconds:238,escalation_rate:3,compliance_score:96,call_quality:90}, recent_calls:[{call_id:'C1010',date:D(1),duration_seconds:235,intent:'account update',outcome:'resolved',transcript_excerpt:'Agent: Updated and confirmation email sent. Everything else looking correct? Customer: Yes, that\'s everything.',flags:[]}], latent_issue_type:'none', latent_issue_evidence:[]},
  { id:'A011', name:'Emma Walsh', tenure_months:27, cps:84, cps_threshold:75, cps_trend_7d:[83,84,85,84,83,84,84], metrics:{csat:87,fcr:81,aht_seconds:275,escalation_rate:5,compliance_score:92,call_quality:84}, recent_calls:[{call_id:'C1011',date:D(3),duration_seconds:272,intent:'billing inquiry',outcome:'resolved',transcript_excerpt:'Agent: That charge was the annual renewal authorized in November. I can send you a copy of the agreement. Customer: That would be great.',flags:[]}], latent_issue_type:'none', latent_issue_evidence:[]},
  { id:'A012', name:'David Park', tenure_months:38, cps:91, cps_threshold:75, cps_trend_7d:[90,91,92,91,90,91,91], metrics:{csat:94,fcr:88,aht_seconds:242,escalation_rate:3,compliance_score:97,call_quality:91}, recent_calls:[{call_id:'C1012',date:D(2),duration_seconds:240,intent:'plan change',outcome:'resolved',transcript_excerpt:'Agent: Switched to business tier effective today. Prorated credit on your next statement. New features available immediately. Customer: Excellent.',flags:[]}], latent_issue_type:'none', latent_issue_evidence:[]},
  { id:'A013', name:'Priya Sharma', tenure_months:17, cps:78, cps_threshold:75, cps_trend_7d:[77,78,79,78,77,78,78], metrics:{csat:81,fcr:76,aht_seconds:315,escalation_rate:7,compliance_score:86,call_quality:79}, recent_calls:[{call_id:'C1013',date:D(4),duration_seconds:312,intent:'technical issue',outcome:'resolved',transcript_excerpt:'Agent: There\'s an outage in your area — our team is on it. I\'ll note your account for a service credit automatically. Customer: Thank you.',flags:[]}], latent_issue_type:'none', latent_issue_evidence:[]},
  { id:'A014', name:'Ryan Cooper', tenure_months:29, cps:86, cps_threshold:75, cps_trend_7d:[85,86,87,86,85,86,86], metrics:{csat:89,fcr:83,aht_seconds:260,escalation_rate:4,compliance_score:92,call_quality:86}, recent_calls:[{call_id:'C1014',date:D(2),duration_seconds:258,intent:'renewal inquiry',outcome:'resolved',transcript_excerpt:'Agent: I can lock in your current rate for another year right now. Customer: Let\'s do that.',flags:[]}], latent_issue_type:'none', latent_issue_evidence:[]},
  { id:'A015', name:'Jasmine Brooks', tenure_months:44, cps:94, cps_threshold:75, cps_trend_7d:[93,94,95,94,93,94,94], metrics:{csat:96,fcr:92,aht_seconds:222,escalation_rate:2,compliance_score:98,call_quality:94}, recent_calls:[{call_id:'C1015',date:D(1),duration_seconds:220,intent:'payment arrangement',outcome:'resolved',transcript_excerpt:'Agent: I\'ve set up three installments starting the 1st — won\'t affect your service. Customer: Thank you for understanding.',flags:[]}], latent_issue_type:'none', latent_issue_evidence:[]},
  { id:'A016', name:'Kevin O\'Brien', tenure_months:20, cps:80, cps_threshold:75, cps_trend_7d:[79,80,81,80,79,80,80], metrics:{csat:83,fcr:78,aht_seconds:298,escalation_rate:6,compliance_score:88,call_quality:80}, recent_calls:[{call_id:'C1016',date:D(3),duration_seconds:295,intent:'refund inquiry',outcome:'resolved',transcript_excerpt:'Agent: Within the 30-day window — processing full refund now. Customer: Thank you.',flags:[]}], latent_issue_type:'none', latent_issue_evidence:[]},
  { id:'A017', name:'Fatima Al-Hassan', tenure_months:35, cps:89, cps_threshold:75, cps_trend_7d:[88,89,90,89,88,89,89], metrics:{csat:92,fcr:86,aht_seconds:250,escalation_rate:4,compliance_score:95,call_quality:89}, recent_calls:[{call_id:'C1017',date:D(2),duration_seconds:248,intent:'service activation',outcome:'resolved',transcript_excerpt:'Agent: Service is active — you\'ll have full access within 15 minutes. Customer: Wonderful.',flags:[]}], latent_issue_type:'none', latent_issue_evidence:[]},
  { id:'A018', name:'Alex Turner', tenure_months:12, cps:76, cps_threshold:75, cps_trend_7d:[75,76,77,76,75,76,76], metrics:{csat:79,fcr:74,aht_seconds:328,escalation_rate:8,compliance_score:84,call_quality:77}, recent_calls:[{call_id:'C1018',date:D(4),duration_seconds:325,intent:'complaint',outcome:'escalated',transcript_excerpt:'Agent: Let me connect you with my supervisor who has more authority to resolve this. Customer: I want this handled today.',flags:['escalation']}], latent_issue_type:'none', latent_issue_evidence:[]},
  { id:'A019', name:'Rachel Nguyen', tenure_months:26, cps:82, cps_threshold:75, cps_trend_7d:[81,82,83,82,81,82,82], metrics:{csat:85,fcr:79,aht_seconds:282,escalation_rate:5,compliance_score:90,call_quality:82}, recent_calls:[{call_id:'C1019',date:D(3),duration_seconds:280,intent:'billing dispute',outcome:'resolved',transcript_excerpt:'Agent: I can see the discrepancy — removing the erroneous charge now. Your balance corrects within 24 hours. Customer: Thank you.',flags:[]}], latent_issue_type:'none', latent_issue_evidence:[]},
  { id:'A020', name:'Brian Tran', tenure_months:40, cps:93, cps_threshold:75, cps_trend_7d:[92,93,94,93,92,93,93], metrics:{csat:95,fcr:90,aht_seconds:230,escalation_rate:2,compliance_score:97,call_quality:93}, recent_calls:[{call_id:'C1020',date:D(1),duration_seconds:228,intent:'product inquiry',outcome:'resolved',transcript_excerpt:'Agent: The enterprise package includes dedicated support and API access. Given what you described, it would be a strong fit. Customer: Let\'s schedule a follow-up.',flags:[]}], latent_issue_type:'none', latent_issue_evidence:[]},
  { id:'A021', name:'Christine Lee', tenure_months:32, cps:88, cps_threshold:75, cps_trend_7d:[87,88,89,88,87,88,88], metrics:{csat:91,fcr:85,aht_seconds:255,escalation_rate:4,compliance_score:94,call_quality:88}, recent_calls:[{call_id:'C1021',date:D(2),duration_seconds:252,intent:'account security',outcome:'resolved',transcript_excerpt:'Agent: The unauthorized access attempt was blocked. I\'m resetting your credentials now and sending security guidance. Customer: Thank goodness.',flags:[]}], latent_issue_type:'none', latent_issue_evidence:[]},
  { id:'A022', name:'Hassan Diallo', tenure_months:18, cps:79, cps_threshold:75, cps_trend_7d:[78,79,80,79,78,79,79], metrics:{csat:82,fcr:77,aht_seconds:308,escalation_rate:6,compliance_score:87,call_quality:79}, recent_calls:[{call_id:'C1022',date:D(3),duration_seconds:305,intent:'service issue',outcome:'resolved',transcript_excerpt:'Agent: Pushing a settings update now — give it 5 minutes. Customer: Okay.',flags:[]}], latent_issue_type:'none', latent_issue_evidence:[]},
  { id:'A023', name:'Lauren Scott', tenure_months:45, cps:97, cps_threshold:75, cps_trend_7d:[96,97,98,97,96,97,97], metrics:{csat:99,fcr:95,aht_seconds:208,escalation_rate:1,compliance_score:99,call_quality:97}, recent_calls:[{call_id:'C1023',date:D(1),duration_seconds:205,intent:'loyalty inquiry',outcome:'resolved',transcript_excerpt:'Agent: 6 years with us — I\'m applying our VIP rate, 15% off locked for 24 months. Customer: Wow, better than I expected!',flags:[]}], latent_issue_type:'none', latent_issue_evidence:[]},
  { id:'A024', name:'Oliver James', tenure_months:23, cps:83, cps_threshold:75, cps_trend_7d:[82,83,84,83,82,83,83], metrics:{csat:86,fcr:80,aht_seconds:278,escalation_rate:5,compliance_score:91,call_quality:83}, recent_calls:[{call_id:'C1024',date:D(2),duration_seconds:275,intent:'upgrade inquiry',outcome:'resolved',transcript_excerpt:'Agent: The Pro tier would resolve your speed issues. Want me to walk you through it now? Customer: Yes please.',flags:[]}], latent_issue_type:'none', latent_issue_evidence:[]},
  { id:'A025', name:'Nina Rodriguez', tenure_months:30, cps:87, cps_threshold:75, cps_trend_7d:[86,87,88,87,86,87,87], metrics:{csat:90,fcr:84,aht_seconds:258,escalation_rate:4,compliance_score:93,call_quality:87}, recent_calls:[{call_id:'C1025',date:D(2),duration_seconds:255,intent:'order status',outcome:'resolved',transcript_excerpt:'Agent: Order shipped yesterday, arrives Thursday. Sending tracking now. Anything else? Customer: That\'s all.',flags:[]}], latent_issue_type:'none', latent_issue_evidence:[]},
  { id:'A026', name:'Patrick Murphy', tenure_months:37, cps:91, cps_threshold:75, cps_trend_7d:[90,91,92,91,90,91,91], metrics:{csat:94,fcr:88,aht_seconds:240,escalation_rate:3,compliance_score:96,call_quality:91}, recent_calls:[{call_id:'C1026',date:D(1),duration_seconds:238,intent:'billing',outcome:'resolved',transcript_excerpt:'Agent: That\'s the annual fee — I\'ve added a note so you\'ll get a heads-up email next year before it posts. Customer: Very considerate.',flags:[]}], latent_issue_type:'none', latent_issue_evidence:[]},
  { id:'A027', name:'Angela Zhou', tenure_months:14, cps:77, cps_threshold:75, cps_trend_7d:[76,77,78,77,76,77,77], metrics:{csat:80,fcr:75,aht_seconds:318,escalation_rate:7,compliance_score:85,call_quality:78}, recent_calls:[{call_id:'C1027',date:D(4),duration_seconds:315,intent:'technical support',outcome:'callback',transcript_excerpt:'Agent: I\'m escalating to Level 2 — they\'ll reach out within 4 hours. Customer: Alright.',flags:['callback required']}], latent_issue_type:'none', latent_issue_evidence:[]},
  { id:'A028', name:'Samuel Osei', tenure_months:41, cps:94, cps_threshold:75, cps_trend_7d:[93,94,95,94,93,94,94], metrics:{csat:96,fcr:91,aht_seconds:225,escalation_rate:2,compliance_score:98,call_quality:94}, recent_calls:[{call_id:'C1028',date:D(1),duration_seconds:222,intent:'feedback',outcome:'resolved',transcript_excerpt:'Agent: Thank you for this feedback — I\'m also offering a complimentary month as a thank-you for your loyalty. Customer: That\'s generous.',flags:[]}], latent_issue_type:'none', latent_issue_evidence:[]},
  { id:'A029', name:'Diana Foster', tenure_months:21, cps:81, cps_threshold:75, cps_trend_7d:[80,81,82,81,80,81,81], metrics:{csat:84,fcr:79,aht_seconds:292,escalation_rate:6,compliance_score:89,call_quality:81}, recent_calls:[{call_id:'C1029',date:D(3),duration_seconds:290,intent:'address change',outcome:'resolved',transcript_excerpt:'Agent: Billing and service address updated. Confirmation sent to your email on file. Customer: Perfect.',flags:[]}], latent_issue_type:'none', latent_issue_evidence:[]},
  { id:'A030', name:'Michael Barnes', tenure_months:46, cps:96, cps_threshold:75, cps_trend_7d:[95,96,97,96,95,96,96], metrics:{csat:98,fcr:93,aht_seconds:215,escalation_rate:1,compliance_score:99,call_quality:96}, recent_calls:[{call_id:'C1030',date:D(1),duration_seconds:212,intent:'account review',outcome:'resolved',transcript_excerpt:'Agent: All clear — no issues, renewal in August, rate is locked. Customer: Just wanted peace of mind. Thanks.',flags:[]}], latent_issue_type:'none', latent_issue_evidence:[]},
  { id:'A031', name:'Tanya Brennan', tenure_months:25, cps:85, cps_threshold:75, cps_trend_7d:[84,85,86,85,84,85,85], metrics:{csat:88,fcr:82,aht_seconds:265,escalation_rate:4,compliance_score:92,call_quality:85}, recent_calls:[{call_id:'C1031',date:D(2),duration_seconds:262,intent:'payment method update',outcome:'resolved',transcript_excerpt:'Agent: New card saved, charges on the 28th, paperless billing set up. Customer: Great, thank you.',flags:[]}], latent_issue_type:'none', latent_issue_evidence:[]},
  { id:'A032', name:'Vincent Okafor', tenure_months:34, cps:90, cps_threshold:75, cps_trend_7d:[89,90,91,90,89,90,90], metrics:{csat:93,fcr:87,aht_seconds:245,escalation_rate:3,compliance_score:96,call_quality:90}, recent_calls:[{call_id:'C1032',date:D(1),duration_seconds:242,intent:'feature inquiry',outcome:'resolved',transcript_excerpt:'Agent: That feature rolled out Tuesday — Settings → Advanced Features → toggle on. Customer: Found it, exactly what I needed.',flags:[]}], latent_issue_type:'none', latent_issue_evidence:[]},

  // ── BELOW THRESHOLD — KNOWLEDGE GAP (A033–A038) ──────────────────────────

  { id:'A033', name:'Tyler Brooks', tenure_months:16, cps:62, cps_threshold:75, cps_trend_7d:[64,63,63,62,61,62,62],
    metrics:{csat:68,fcr:58,aht_seconds:335,escalation_rate:12,compliance_score:72,call_quality:74},
    recent_calls:[
      {call_id:'C3301',date:D(1),duration_seconds:340,intent:'data plan inquiry',outcome:'escalated',
       transcript_excerpt:'Customer: Does unused data roll over? Agent: Yes, all plans include rollover. Customer: I thought only premium plans get rollover. Agent: Right — sorry, it is only premium. I had that wrong.',
       flags:['incorrect product information','contradicted self mid-call','customer corrected agent']},
      {call_id:'C3302',date:D(3),duration_seconds:318,intent:'roaming charges',outcome:'escalated',
       transcript_excerpt:'Customer: International was supposed to be included but I got a $45 roaming charge. Agent: International data is included in your plan. Customer: Then why was I charged? Agent: Oh — calls are included but data roaming is a separate add-on. I apologize.',
       flags:['policy misstatement','plan feature confusion','escalation required']},
      {call_id:'C3303',date:D(5),duration_seconds:298,intent:'add-on activation',outcome:'callback',
       transcript_excerpt:'Customer: I want the streaming bundle. Agent: That\'s $12 a month, includes Netflix and Spotify. Customer: The website says $15. Agent: Let me check... you\'re right, $15. I had the wrong price. Sorry.',
       flags:['incorrect pricing stated','customer corrected agent','callback required']},
    ], latent_issue_type:'knowledge', latent_issue_evidence:['Incorrectly stated data rollover policy on C3301','Misstated international data roaming inclusion on C3302','Quoted wrong add-on pricing on C3303 — corrected by customer']},

  { id:'A034', name:'Mei Lin', tenure_months:11, cps:65, cps_threshold:75, cps_trend_7d:[67,66,66,65,65,64,65],
    metrics:{csat:70,fcr:61,aht_seconds:320,escalation_rate:10,compliance_score:75,call_quality:76},
    recent_calls:[
      {call_id:'C3401',date:D(1),duration_seconds:325,intent:'contract terms',outcome:'escalated',
       transcript_excerpt:'Customer: What\'s the early termination fee? Agent: $150. Customer: My paperwork says $200. Agent: Let me look — for your contract tier it is $200. I apologize for the wrong information.',
       flags:['incorrect ETF stated','customer had correct information','contract terms error']},
      {call_id:'C3402',date:D(4),duration_seconds:308,intent:'upgrade eligibility',outcome:'escalated',
       transcript_excerpt:'Customer: Am I eligible for an upgrade? Agent: Yes, you\'re eligible right now. Customer: The website says I have 4 months left. Agent: Oh — your eligibility date is August 12th. I was looking at the wrong field.',
       flags:['incorrect eligibility date','agent looked at wrong field','customer corrected']},
      {call_id:'C3403',date:D(6),duration_seconds:290,intent:'billing cycle',outcome:'resolved',
       transcript_excerpt:'Customer: When does my bill generate? Agent: The 15th. Customer: It\'s been the 1st for two years. Agent: You\'re correct — I see it\'s the 1st. I apologize for the misinformation.',
       flags:['billing date incorrect','basic account detail wrong']},
    ], latent_issue_type:'knowledge', latent_issue_evidence:['Quoted wrong ETF on C3401','Stated wrong upgrade eligibility date on C3402 — admitted to looking at wrong field','Gave incorrect billing cycle on C3403']},

  { id:'A035', name:'Jordan Walsh', tenure_months:20, cps:60, cps_threshold:75, cps_trend_7d:[63,62,61,61,60,60,60],
    metrics:{csat:65,fcr:55,aht_seconds:342,escalation_rate:14,compliance_score:70,call_quality:72},
    recent_calls:[
      {call_id:'C3501',date:D(2),duration_seconds:348,intent:'refund policy',outcome:'escalated',
       transcript_excerpt:'Customer: Can I get a refund? Agent: Policy is refunds within 7 days of billing. Customer: I thought it was 30 days. Agent: Let me check... it is 30 days. I misspoke. Sorry.',
       flags:['incorrect refund window stated','customer corrected agent','escalation required']},
      {call_id:'C3502',date:D(4),duration_seconds:322,intent:'promo code',outcome:'callback',
       transcript_excerpt:'Customer: I have a promo code. Agent: That gives you 20% off for 3 months. Customer: The email says 25% off for 6 months. Agent: You\'re right — I had the wrong promo details. My apologies.',
       flags:['incorrect promo terms','customer corrected agent','callback required']},
      {call_id:'C3503',date:D(6),duration_seconds:310,intent:'autopay setup',outcome:'resolved',
       transcript_excerpt:'Customer: Does autopay charge on the due date? Agent: Yes, on the due date. Customer: I heard there\'s a 3-day buffer. Agent: Yes, there\'s a 3-day processing window. I should have known that.',
       flags:['autopay mechanics incorrect','agent acknowledged knowledge gap']},
    ], latent_issue_type:'knowledge', latent_issue_evidence:['Misstated refund window on C3501','Quoted wrong promo terms on C3502','Autopay processing rules incorrect on C3503']},

  { id:'A036', name:'Isabel Torres', tenure_months:14, cps:67, cps_threshold:75, cps_trend_7d:[69,68,68,67,67,66,67],
    metrics:{csat:71,fcr:63,aht_seconds:315,escalation_rate:11,compliance_score:76,call_quality:77},
    recent_calls:[
      {call_id:'C3601',date:D(2),duration_seconds:320,intent:'family plan',outcome:'escalated',
       transcript_excerpt:'Customer: How many lines on the family plan? Agent: Up to 4. Customer: Online says up to 6. Agent: Let me check — yes, 6 lines. I had the old limit. I apologize.',
       flags:['outdated plan information','customer corrected agent','product knowledge gap']},
      {call_id:'C3602',date:D(4),duration_seconds:302,intent:'device insurance',outcome:'callback',
       transcript_excerpt:'Customer: What\'s the deductible for screen repair? Agent: $50. Customer: I read it was $99 for screens. Agent: Let me check the coverage sheet... you\'re right, $99 for screens. I apologize.',
       flags:['incorrect deductible stated','customer had more accurate information']},
    ], latent_issue_type:'knowledge', latent_issue_evidence:['Gave outdated family plan line limit on C3601','Quoted wrong insurance deductible on C3602 — customer corrected']},

  { id:'A037', name:'Nathan Pierce', tenure_months:18, cps:64, cps_threshold:75, cps_trend_7d:[66,65,65,64,64,63,64],
    metrics:{csat:69,fcr:59,aht_seconds:330,escalation_rate:13,compliance_score:73,call_quality:75},
    recent_calls:[
      {call_id:'C3701',date:D(1),duration_seconds:335,intent:'number porting',outcome:'escalated',
       transcript_excerpt:'Customer: How long to port my number? Agent: About 24 hours. Customer: I\'ve seen up to 72. Agent: For business accounts it can take longer. I should have asked account type first.',
       flags:['oversimplified porting timeframe','failed to establish account type','customer had better information']},
      {call_id:'C3702',date:D(3),duration_seconds:318,intent:'voicemail setup',outcome:'callback',
       transcript_excerpt:'Customer: How do I set up voicemail? Agent: Dial star-86. Customer: Not working. Agent: I\'m sorry — that\'s for older handsets. For your model go to Settings → Phone → Voicemail. I gave you wrong instructions.',
       flags:['incorrect setup instructions','customer had to call back','device-specific knowledge gap']},
    ], latent_issue_type:'knowledge', latent_issue_evidence:['Oversimplified porting timeframe on C3701 without establishing account type','Gave wrong voicemail setup instructions on C3702 for device model']},

  { id:'A038', name:'Chloe Yamamoto', tenure_months:22, cps:63, cps_threshold:75, cps_trend_7d:[65,64,64,63,63,62,63],
    metrics:{csat:67,fcr:57,aht_seconds:338,escalation_rate:13,compliance_score:71,call_quality:73},
    recent_calls:[
      {call_id:'C3801',date:D(2),duration_seconds:342,intent:'late payment policy',outcome:'escalated',
       transcript_excerpt:'Customer: Will service interrupt if I pay 5 days late? Agent: No, there\'s a 10-day grace period. Customer: I got a suspension notice at 5 days. Agent: For your account tier the grace period is only 3 days. I had the standard tier\'s period, not yours.',
       flags:['incorrect grace period stated','tier-specific policy unknown','customer received suspension notice']},
      {call_id:'C3802',date:D(5),duration_seconds:315,intent:'throttling inquiry',outcome:'callback',
       transcript_excerpt:'Customer: Am I being throttled? I\'m on unlimited. Agent: Throttling only happens if you exceed your data cap. Customer: I\'m on unlimited. Agent: Unlimited plans have a priority threshold — after 50GB speeds may reduce during congestion. I should have clarified that.',
       flags:['unlimited plan throttling policy incomplete','callback required']},
    ], latent_issue_type:'knowledge', latent_issue_evidence:['Stated wrong grace period for account tier on C3801','Incomplete explanation of unlimited plan throttling policy on C3802']},

  // ── BELOW THRESHOLD — ONBOARDING (A039–A041) ─────────────────────────────

  { id:'A039', name:'Zoe Campbell', tenure_months:2, cps:58, cps_threshold:75, cps_trend_7d:[62,60,58,55,57,59,58],
    metrics:{csat:62,fcr:50,aht_seconds:485,escalation_rate:18,compliance_score:68,call_quality:66},
    recent_calls:[
      {call_id:'C3901',date:D(1),duration_seconds:490,intent:'new service setup',outcome:'escalated',
       transcript_excerpt:'Customer: I need to set up my new account. Agent: Sure — one moment... I need to find the provisioning tool... Customer: Is something wrong? Agent: No, I\'m still locating the right screen. It\'s my second week doing setups. I want to make sure I do this right for you.',
       flags:['long hold periods navigating system','agent verbalized uncertainty','elevated handle time']},
      {call_id:'C3902',date:D(3),duration_seconds:520,intent:'bill explanation',outcome:'callback',
       transcript_excerpt:'Customer: Can you explain these line items? Agent: The activation fee is a one-time charge. This next line — I need to check what that code means. Give me a moment... Customer: Can someone else handle this? Agent: Let me get my supervisor to help walk through it with us.',
       flags:['required reference material for basic billing','multiple long pauses','callback issued — could not complete']},
    ], latent_issue_type:'onboarding', latent_issue_evidence:['2 months tenure — still learning provisioning system navigation (C3901)','Unable to explain standard bill line items without supervisor (C3902)','AHT 485s vs. team average ~260s']},

  { id:'A040', name:'Darius King', tenure_months:1, cps:55, cps_threshold:75, cps_trend_7d:[60,58,56,54,55,56,55],
    metrics:{csat:58,fcr:45,aht_seconds:520,escalation_rate:22,compliance_score:64,call_quality:63},
    recent_calls:[
      {call_id:'C4001',date:D(1),duration_seconds:528,intent:'cancellation request',outcome:'escalated',
       transcript_excerpt:'Customer: I want to cancel. Agent: Let me look up the cancellation process — I want to do this correctly. Customer: You don\'t know how to cancel? Agent: I\'ve only done one before. Customer: Can I speak to someone more experienced?',
       flags:['agent disclosed inexperience to customer','escalation requested by customer','cancellation workflow unfamiliar']},
      {call_id:'C4002',date:D(4),duration_seconds:512,intent:'payment dispute',outcome:'escalated',
       transcript_excerpt:'Customer: I was charged twice. Agent: I see two charges — let me find the disputes tool... Customer: How long will this take? Agent: Disputes are still new to me. Let me get my supervisor.',
       flags:['dispute resolution process unfamiliar','supervisor required','customer expressed frustration']},
    ], latent_issue_type:'onboarding', latent_issue_evidence:['1 month tenure — disclosed inexperience to customer on C4001','Unfamiliar with dispute resolution workflow on C4002 — required supervisor','FCR 45% and escalation rate 22% indicate foundational process gaps']},

  { id:'A041', name:'Simone Bernard', tenure_months:2, cps:60, cps_threshold:75, cps_trend_7d:[65,63,61,59,60,61,60],
    metrics:{csat:63,fcr:52,aht_seconds:468,escalation_rate:16,compliance_score:70,call_quality:68},
    recent_calls:[
      {call_id:'C4101',date:D(2),duration_seconds:475,intent:'technical troubleshooting',outcome:'callback',
       transcript_excerpt:'Customer: Internet keeps dropping. Agent: Let me run diagnostics — I think it\'s in the Network tab. Customer: You think? Agent: I\'m still learning where everything is. Let me check with my team lead.',
       flags:['system navigation uncertain','team lead consultation required','callback issued']},
      {call_id:'C4102',date:D(5),duration_seconds:460,intent:'account transfer',outcome:'escalated',
       transcript_excerpt:'Customer: I need to transfer this account to my daughter. Agent: Account transfers — let me see... I haven\'t done one before. Customer: Is this something you handle? Agent: Yes — I just need to find the right form in the system.',
       flags:['unfamiliar with account transfer process','prolonged system search','escalated to experienced agent']},
    ], latent_issue_type:'onboarding', latent_issue_evidence:['2 months tenure — system navigation uncertain across call types (C4101, C4102)','Has not handled account transfer process before (C4102)','Consistent 460-475s AHT due to navigation delays']},

  // ── BELOW THRESHOLD — LOGISTICS (A042–A044) ───────────────────────────────

  { id:'A042', name:'Marcus Webb', tenure_months:29, cps:68, cps_threshold:75, cps_trend_7d:[70,69,69,68,67,68,68],
    metrics:{csat:79,fcr:65,aht_seconds:552,escalation_rate:9,compliance_score:88,call_quality:85},
    recent_calls:[
      {call_id:'C4201',date:D(1),duration_seconds:558,intent:'account adjustment',outcome:'callback',
       transcript_excerpt:'Customer: Can you apply the credit? Agent: Opening the credit tool — it\'s loading slowly. I\'ll put you on a brief pause. Sorry — it\'s throwing an error. I\'ll have to submit this manually and someone will follow up.',
       flags:['credit tool system error','manual workaround required','callback issued — system failure']},
      {call_id:'C4202',date:D(3),duration_seconds:580,intent:'billing correction',outcome:'callback',
       transcript_excerpt:'Customer: There\'s a wrong charge. Agent: I see it — the billing adjustment screen isn\'t letting me save. This is the same issue I reported yesterday. I\'ll have to put in a ticket. Customer: You can\'t fix it now?',
       flags:['billing system save error','known issue — second consecutive day','unable to complete adjustment']},
    ], latent_issue_type:'logistics', latent_issue_evidence:['Credit tool error prevented resolution on C4201 — manual workaround required','Billing adjustment system down second consecutive day on C4202','AHT 552s — elevated from system latency, not agent behavior; call quality score 85']},

  { id:'A043', name:'Patricia Owens', tenure_months:33, cps:66, cps_threshold:75, cps_trend_7d:[68,67,67,66,65,66,66],
    metrics:{csat:77,fcr:62,aht_seconds:578,escalation_rate:10,compliance_score:87,call_quality:84},
    recent_calls:[
      {call_id:'C4301',date:D(2),duration_seconds:585,intent:'plan change',outcome:'callback',
       transcript_excerpt:'Customer: Switch me to the business plan. Agent: I\'m getting a permissions error on plan management. This has been happening since the system update Tuesday. I need to escalate to back-office.',
       flags:['permissions error preventing plan change','system update regression','back-office escalation required']},
      {call_id:'C4302',date:D(4),duration_seconds:571,intent:'number port',outcome:'escalated',
       transcript_excerpt:'Customer: I\'m porting from Verizon. Agent: The porting tool is slow — our platform migration affected it. I\'ll need to manually log this and our porting team will process it.',
       flags:['porting tool slow — platform migration','manual logging required','elevated AHT from system latency']},
    ], latent_issue_type:'logistics', latent_issue_evidence:['Permissions error blocking plan changes since Tuesday system update (C4301)','Platform migration causing porting tool slowness (C4302)','Agent quality score 84 and CSAT 77 indicate no skill issue — performance gap is tooling']},

  { id:'A044', name:'Jerome Davis', tenure_months:25, cps:70, cps_threshold:75, cps_trend_7d:[72,71,71,70,70,69,70],
    metrics:{csat:80,fcr:67,aht_seconds:535,escalation_rate:8,compliance_score:89,call_quality:86},
    recent_calls:[
      {call_id:'C4401',date:D(1),duration_seconds:540,intent:'service inquiry',outcome:'resolved',
       transcript_excerpt:'Customer: Can you tell me my services? Agent: CRM is loading slowly — I\'ve flagged it to IT. Using the backup query tool now. Customer: Take your time. Agent: Thank you for your patience.',
       flags:['CRM latency — IT ticket filed','backup tool required','elevated AHT from system issue']},
      {call_id:'C4402',date:D(3),duration_seconds:528,intent:'transfer request',outcome:'resolved',
       transcript_excerpt:'Customer: Transfer me to technical. Agent: Transfer system has limited capacity — queue longer than usual. I\'ll stay on the line until you\'re connected. Customer: I appreciate you staying.',
       flags:['transfer system capacity constraints','extended hold to complete transfer','agent behavior appropriate']},
    ], latent_issue_type:'logistics', latent_issue_evidence:['CRM latency requiring backup tools (C4401) — IT ticket filed','Transfer system capacity constraints elevating handle time (C4402)','Quality score 86 and CSAT 80 confirm no agent skill issue']},

  // ── BELOW THRESHOLD — PERSONAL (A045–A047) ───────────────────────────────

  { id:'A045', name:'Rebecca Chen', tenure_months:31, cps:52, cps_threshold:75, cps_trend_7d:[81,79,74,68,60,55,52],
    metrics:{csat:56,fcr:48,aht_seconds:358,escalation_rate:16,compliance_score:71,call_quality:65},
    recent_calls:[
      {call_id:'C4501',date:D(1),duration_seconds:362,intent:'billing inquiry',outcome:'escalated',
       transcript_excerpt:'Customer: Can you explain this charge? Agent: It\'s the monthly fee. Customer: Why did it go up? Agent: It just did. Customer: Can you be more specific? Agent: I — I\'m sorry, I\'m having trouble focusing today. Let me transfer you to someone who can help better.',
       flags:['minimal explanation','self-disclosed focus difficulty','agent-initiated transfer','disengaged tone']},
      {call_id:'C4502',date:D(3),duration_seconds:345,intent:'account review',outcome:'escalated',
       transcript_excerpt:'Customer: Just want to check my account. Agent: Everything looks... fine. Customer: Any upcoming changes? Agent: Not that I see. Customer: You don\'t sound sure. Agent: I\'m sorry — I\'m doing my best today.',
       flags:['brief non-committal responses','customer noticed disengagement','empathy miss','incomplete review']},
    ], latent_issue_type:'personal', latent_issue_evidence:['29-point CPS drop over 7 days (81→52) with no prior decline pattern','Agent self-disclosed focus difficulty on C4501 — transferred customer','Customer noticed disengagement on C4502 and commented directly','Pattern consistent with personal distress, not skill or knowledge issue']},

  { id:'A046', name:'Andre Mitchell', tenure_months:26, cps:57, cps_threshold:75, cps_trend_7d:[84,82,76,70,63,59,57],
    metrics:{csat:60,fcr:50,aht_seconds:340,escalation_rate:15,compliance_score:73,call_quality:67},
    recent_calls:[
      {call_id:'C4601',date:D(2),duration_seconds:345,intent:'plan upgrade',outcome:'escalated',
       transcript_excerpt:'Customer: What do you recommend for upgrades? Agent: Any of them would work. Customer: That\'s not helpful. Agent: I\'m sorry — I\'m going to be honest, I\'m having a hard time today. Let me connect you with a colleague.',
       flags:['no recommendation provided','disclosed personal difficulty','self-initiated transfer']},
      {call_id:'C4602',date:D(4),duration_seconds:328,intent:'complaint',outcome:'escalated',
       transcript_excerpt:'Customer: I want to complain about last month. Agent: Okay. Customer: Is that all you\'re going to say? Agent: I apologize — I\'m listening. Customer: It doesn\'t feel like you\'re listening. Agent: I\'m sorry.',
       flags:['insufficient engagement','customer felt unheard','empathy absent','escalated by customer request']},
    ], latent_issue_type:'personal', latent_issue_evidence:['27-point CPS drop over 7 days (84→57) — sharp, recent, no prior pattern','Disclosed personal difficulty to customer on C4601 — atypical for 26-month agent','Described as not listening on C4602 — customer initiated escalation']},

  { id:'A047', name:'Tanisha Moore', tenure_months:22, cps:59, cps_threshold:75, cps_trend_7d:[82,80,75,70,64,61,59],
    metrics:{csat:62,fcr:52,aht_seconds:348,escalation_rate:14,compliance_score:74,call_quality:68},
    recent_calls:[
      {call_id:'C4701',date:D(1),duration_seconds:352,intent:'cancellation',outcome:'escalated',
       transcript_excerpt:'Customer: Thinking about cancelling. Agent: Okay. Customer: Don\'t you want to keep me? Agent: Of course — sorry. What\'s prompting it? Customer: You seem distracted. Agent: I apologize. I\'m not at my best today.',
       flags:['failed to engage save immediately','customer commented on distraction','disengaged delivery']},
      {call_id:'C4702',date:D(5),duration_seconds:335,intent:'billing',outcome:'resolved',
       transcript_excerpt:'Customer: Why this amount? Agent: Monthly charge. Customer: Same as last month? Agent: Yes. Customer: You seem off today. Agent: I\'m sorry — I am going through something. The charge is correct though.',
       flags:['brief non-elaborated answers','customer-noticed change','disclosed personal difficulty']},
    ], latent_issue_type:'personal', latent_issue_evidence:['23-point CPS drop over 7 days (82→59) — sudden, no prior decline','Customer commented on distraction unprompted on C4701 and C4702','Agent confirmed personal difficulty on C4702 — behavioral change not performance-skill']},

  // ── BELOW THRESHOLD — POLICY (A048) ─────────────────────────────────────

  { id:'A048', name:'Kyle Harrison', tenure_months:19, cps:61, cps_threshold:75, cps_trend_7d:[63,62,62,61,61,60,61],
    metrics:{csat:66,fcr:57,aht_seconds:330,escalation_rate:12,compliance_score:58,call_quality:72},
    recent_calls:[
      {call_id:'C4801',date:D(1),duration_seconds:338,intent:'privacy data inquiry',outcome:'escalated',
       transcript_excerpt:'Customer: What data do you store? Agent: The usual — name, billing, call history. Customer: What about recordings? Agent: We record for quality. Customer: Did you disclose that at the start? Agent: I... I may have skipped it actually.',
       flags:['call recording disclosure omitted','compliance breach — required disclosure','agent acknowledged omission','regulatory risk']},
      {call_id:'C4802',date:D(3),duration_seconds:318,intent:'account access',outcome:'escalated',
       transcript_excerpt:'Customer: My wife needs to access our account — she\'s here. Can she talk to you? Agent: Sure, go ahead. [Voice changes] Agent proceeds without re-verification.',
       flags:['identity verification bypassed mid-call','unauthorized party access','compliance protocol violation','escalated to compliance team']},
      {call_id:'C4803',date:D(6),duration_seconds:308,intent:'billing inquiry',outcome:'resolved',
       transcript_excerpt:'Customer: What\'s this for? Agent: Your service plan — you\'re all set. Customer: Can I get that in writing? Agent: Sure. [Sends summary with incorrect plan terms listed.]',
       flags:['written summary contained incorrect terms','compliance documentation error','customer received inaccurate written record']},
    ], latent_issue_type:'policy', latent_issue_evidence:['Failed required call recording disclosure on C4801 — agent acknowledged omission','Bypassed identity verification for third party mid-call on C4802 — compliance breach','Sent written summary with incorrect plan terms on C4803 — documentation error']},

  // ── BELOW THRESHOLD — MOTIVATIONAL / GAMING (A049–A050) ──────────────────

  { id:'A049', name:'Victor Haines', tenure_months:38, cps:63, cps_threshold:75, cps_trend_7d:[65,64,64,63,63,62,63],
    metrics:{csat:44,fcr:55,aht_seconds:215,escalation_rate:6,compliance_score:89,call_quality:91},
    recent_calls:[
      {call_id:'C4901',date:D(1),duration_seconds:218,intent:'billing dispute',outcome:'resolved',
       transcript_excerpt:'Customer: I don\'t understand this charge. Agent: I understand your frustration and appreciate your patience. Your account reflects the correct charges per your agreement. Anything else? Customer: You didn\'t actually explain anything. Agent: I\'ve noted your concern. Have a great day.',
       flags:['closed without resolving confusion','scripted empathy without substance','customer expressed unresolved confusion']},
      {call_id:'C4902',date:D(3),duration_seconds:210,intent:'cancellation save',outcome:'resolved',
       transcript_excerpt:'Customer: Thinking of leaving. Agent: I completely understand and we value your business. I\'ve noted your feedback. Anything else? Customer: That\'s it? You\'re not going to try to keep me? Agent: I\'ve documented everything. Thank you.',
       flags:['no save attempt made','marked resolved without resolution','scripted close to end call quickly']},
    ], latent_issue_type:'motivational', latent_issue_evidence:['Call quality 91 — highest in sub-threshold cohort — but CSAT 44 (lowest on team)','C4901: scripted empathy language used without addressing actual customer question','C4902: cancellation call marked resolved with zero save attempt','Pattern consistent with optimizing for scored phrases, not customer outcomes']},

  { id:'A050', name:'Diana Russo', tenure_months:30, cps:65, cps_threshold:75, cps_trend_7d:[67,66,66,65,65,64,65],
    metrics:{csat:47,fcr:57,aht_seconds:208,escalation_rate:5,compliance_score:88,call_quality:89},
    recent_calls:[
      {call_id:'C5001',date:D(2),duration_seconds:212,intent:'technical issue',outcome:'resolved',
       transcript_excerpt:'Customer: Speeds still slow after the reset. Agent: Thank you for letting us know — I\'ve documented the issue and our team will monitor it. Anything else? Customer: That\'s all you\'re going to do? Agent: I understand your concern. Have a wonderful day.',
       flags:['issue not escalated to technical team','marked resolved without technical action','scripted phrases to close unresolved call']},
      {call_id:'C5002',date:D(4),duration_seconds:205,intent:'service complaint',outcome:'resolved',
       transcript_excerpt:'Customer: Third time calling about this. Agent: I sincerely apologize for the inconvenience. Your feedback is very important to us. Customer: Can you fix it? Agent: I\'ve documented everything thoroughly. Have a great day. Customer: You didn\'t fix anything.',
       flags:['repeat caller — 3rd contact same issue','no action beyond documentation','customer confirmed unresolved','AHT 205s — rushed closure']},
    ], latent_issue_type:'motivational', latent_issue_evidence:['Call quality 89 but CSAT 47 — systematic gap consistent with Goodhart\'s Law','C5001: unresolved technical issue marked as resolved — no escalation','C5002: repeat caller (3rd contact) — documented only, customer confirmed nothing fixed','AHT 208s — shortest on team — combined with low FCR suggests closure prioritized over resolution']},
];

// ─── QUEUE RANKING ────────────────────────────────────────────────────────────

const QUEUE_PRIORITY = { personal: 5, policy: 4, motivational: 3, logistics: 0, knowledge: 0, onboarding: 0, none: 0 };

const REASON_LABELS = {
  personal:     'Personal context flag',
  policy:       'Policy escalation',
  motivational: 'Gaming signal',
};

function buildQueue(agents) {
  return agents
    .filter(a => a.cps < a.cps_threshold && QUEUE_PRIORITY[a.latent_issue_type] > 0)
    .sort((a, b) => {
      const pa = QUEUE_PRIORITY[a.latent_issue_type] + (a.cps_threshold - a.cps) / 100;
      const pb = QUEUE_PRIORITY[b.latent_issue_type] + (b.cps_threshold - b.cps) / 100;
      return pb - pa;
    });
}

function buildAutoRouted(agents) {
  return agents.filter(a => a.cps < a.cps_threshold && ['knowledge','onboarding'].includes(a.latent_issue_type));
}

function buildOpsEscalated(agents) {
  return agents.filter(a => a.cps < a.cps_threshold && a.latent_issue_type === 'logistics');
}

// ─── SPARKLINE ────────────────────────────────────────────────────────────────

function Sparkline({ data, height = 36 }) {
  const pts = data.map((v, i) => ({ i, v }));
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={pts} margin={{ top: 4, right: 2, bottom: 4, left: 2 }}>
        <ReferenceLine y={CPS_THRESHOLD} stroke="#f59e0b" strokeDasharray="3 3" strokeWidth={1} />
        <Line type="monotone" dataKey="v" dot={false} strokeWidth={2}
          stroke={data[data.length - 1] >= CPS_THRESHOLD ? '#22c55e' : '#ef4444'} />
      </LineChart>
    </ResponsiveContainer>
  );
}

// ─── CPS BADGE ────────────────────────────────────────────────────────────────

function CpsBadge({ cps, threshold = CPS_THRESHOLD, size = 'sm' }) {
  const color = cps >= threshold ? 'text-green-700 bg-green-50' : cps >= threshold - 10 ? 'text-amber-700 bg-amber-50' : 'text-red-700 bg-red-50';
  return (
    <span className={`inline-flex items-center font-semibold rounded px-1.5 py-0.5 ${size === 'lg' ? 'text-base' : 'text-xs'} ${color}`}>
      {cps}
    </span>
  );
}

// ─── API KEY MODAL ────────────────────────────────────────────────────────────

function ApiKeyModal({ onSubmit }) {
  const [key, setKey] = useState('');
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center mb-4">
          <span className="text-white font-bold text-sm">M</span>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-1">Coaching Command Center</h2>
        <p className="text-sm text-gray-500 mb-6">
          Enter your Anthropic API key to enable agentic diagnosis and coaching plan generation.
          Key is stored in memory only — cleared on page reload.
        </p>
        <input
          type="password"
          value={key}
          onChange={e => setKey(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && key.trim() && onSubmit(key.trim())}
          placeholder="sk-ant-..."
          className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm font-mono mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          autoFocus
        />
        <button
          onClick={() => key.trim() && onSubmit(key.trim())}
          disabled={!key.trim()}
          className="w-full bg-blue-600 text-white rounded-lg py-3 text-sm font-semibold disabled:opacity-40 hover:bg-blue-700 transition-colors"
        >
          Start Session
        </button>
        <p className="text-xs text-gray-400 mt-3 text-center">50 agents · Maya Patel · CPS threshold: 75</p>
      </div>
    </div>
  );
}

// ─── LEFT RAIL ────────────────────────────────────────────────────────────────

function LeftRail({ agents, onStartTour, activeTab, setActiveTab }) {
  const above = agents.filter(a => a.cps >= a.cps_threshold).length;
  const pct = Math.round((above / agents.length) * 100);

  return (
    <div className="w-52 flex-shrink-0 bg-gray-50 border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">M</div>
          <div>
            <div className="font-semibold text-gray-900 text-sm leading-tight">Maya Patel</div>
            <div className="text-xs text-gray-500">Supervisor</div>
          </div>
        </div>
        <div className="text-xs text-gray-500 mb-1">Team CPS — {agents.length} agents</div>
        <div className="text-3xl font-bold text-gray-900 leading-none">{pct}%</div>
        <div className="text-xs text-gray-500 mb-2">{above}/{agents.length} above threshold</div>
        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
        </div>
        <div className="text-xs text-gray-400 mt-1">Threshold CPS 75</div>
      </div>

      <nav className="flex-1 p-2">
        {[['today','Today'],['router','Router'],['plans','Coaching Plans']].map(([id, label]) => (
          <button key={id} onClick={() => setActiveTab(id)}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm mb-0.5 transition-colors ${activeTab === id ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}>
            {label}
          </button>
        ))}
      </nav>

      <div className="p-3 border-t border-gray-200">
        <button onClick={onStartTour}
          className="w-full flex items-center justify-center gap-1.5 bg-blue-600 text-white rounded-lg px-3 py-2 text-sm font-medium hover:bg-blue-700 transition-colors">
          <Play size={13} />
          Start Demo Tour
        </button>
      </div>
    </div>
  );
}

// ─── TAB 1: TODAY ─────────────────────────────────────────────────────────────

function Tab1Today({ agents, routingResults, onOpenAgent, hoursAuto }) {
  const queue = buildQueue(agents);
  const autoRouted = buildAutoRouted(agents);
  const opsEscalated = buildOpsEscalated(agents);
  const above = agents.filter(a => a.cps >= a.cps_threshold).length;
  const [autoExpanded, setAutoExpanded] = useState(false);
  const [opsExpanded, setOpsExpanded] = useState(false);

  const kpis = [
    { label: 'Above CPS threshold', value: `${above} / ${agents.length}`, color: 'text-green-700' },
    { label: 'Need your direct time', value: queue.length, color: 'text-rose-700' },
    { label: 'On automated coaching', value: autoRouted.length, color: 'text-blue-700' },
    { label: 'Hours saved this week', value: `${(autoRouted.length * 0.75).toFixed(1)}h`, color: 'text-purple-700' },
  ];

  const agentCpsDelta = (a) => {
    const avg7 = a.cps_trend_7d.reduce((s, v) => s + v, 0) / 7;
    return Math.round(a.cps - avg7);
  };

  return (
    <div className="p-6">
      {/* KPI strip */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {kpis.map(k => (
          <div key={k.label} className="bg-white border border-gray-200 rounded-xl p-4">
            <div className={`text-2xl font-bold ${k.color}`}>{k.value}</div>
            <div className="text-xs text-gray-500 mt-1">{k.label}</div>
          </div>
        ))}
      </div>

      <div className="flex gap-4">
        {/* Your Queue */}
        <div className="flex-1">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Your Queue Today</h2>
          {queue.length === 0 ? (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center">
              <CheckCircle size={28} className="text-green-500 mx-auto mb-2" />
              <div className="text-sm font-medium text-gray-700">No agents need your direct attention today</div>
              <div className="text-xs text-gray-400 mt-1">The automated path is handling everything</div>
            </div>
          ) : (
            <div className="space-y-2">
              {queue.map(a => {
                const delta = agentCpsDelta(a);
                const ic = ISSUE_COLORS[a.latent_issue_type];
                const reason = REASON_LABELS[a.latent_issue_type] || 'Needs review';
                const context = a.latent_issue_type === 'personal'
                  ? `CPS dropped ${Math.abs(a.cps_trend_7d[0] - a.cps)} pts in 7 days — no prior pattern`
                  : a.latent_issue_type === 'policy'
                  ? 'Compliance flags on multiple calls — requires direct handling'
                  : 'High call quality, low CSAT — gaming signal detected';
                return (
                  <div key={a.id} className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-900 text-sm">{a.name}</span>
                        <span className="text-xs text-gray-400">{a.tenure_months}mo</span>
                        <CpsBadge cps={a.cps} />
                        <span className={`text-xs font-medium ${delta < 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {delta > 0 ? '+' : ''}{delta} vs avg
                        </span>
                      </div>
                      <span className={`inline-block text-xs font-medium rounded-full px-2 py-0.5 mb-1 ${ic.pill}`}>{reason}</span>
                      <div className="text-xs text-gray-500">{context}</div>
                    </div>
                    <button onClick={() => onOpenAgent(a.id)}
                      className="flex-shrink-0 flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800 border border-blue-200 rounded-lg px-3 py-1.5 hover:bg-blue-50 transition-colors">
                      Open
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Auto-routed summary */}
        <div className="w-64 flex-shrink-0">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Auto-Routed</h2>
          <div className="space-y-2">
            {/* Automated coaching */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <button onClick={() => setAutoExpanded(x => !x)}
                className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 transition-colors">
                <div>
                  <div className="text-xs font-medium text-gray-700">Automated Coaching</div>
                  <div className="text-xs text-gray-400">{autoRouted.length} agents — knowledge & onboarding</div>
                </div>
                <span className="text-lg font-bold text-blue-700">{autoRouted.length}</span>
              </button>
              {autoExpanded && (
                <div className="border-t border-gray-100 px-3 pb-3 pt-2 space-y-1">
                  {autoRouted.map(a => (
                    <div key={a.id} className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">{a.name}</span>
                      <CpsBadge cps={a.cps} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Ops escalation */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <button onClick={() => setOpsExpanded(x => !x)}
                className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 transition-colors">
                <div>
                  <div className="text-xs font-medium text-gray-700">Ops Escalation</div>
                  <div className="text-xs text-gray-400">{opsEscalated.length} agents — tooling issues</div>
                </div>
                <span className="text-lg font-bold text-orange-700">{opsEscalated.length}</span>
              </button>
              {opsExpanded && (
                <div className="border-t border-gray-100 px-3 pb-3 pt-2 space-y-1">
                  {opsEscalated.map(a => (
                    <div key={a.id} className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">{a.name}</span>
                      <CpsBadge cps={a.cps} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── TAB 2: ROUTER ────────────────────────────────────────────────────────────

function Tab2Router({ agents, apiKey, routingResults, setRoutingResults, onGoToPlan, selectedAgentId, setSelectedAgentId }) {
  const subThreshold = agents.filter(a => a.cps < a.cps_threshold);
  const [filter, setFilter] = useState('all');
  const [diagnosing, setDiagnosing] = useState(false);
  const [diagError, setDiagError] = useState(null);
  const [loadingMsg, setLoadingMsg] = useState('');
  const [expandedCall, setExpandedCall] = useState(null);
  const [overrideAgent, setOverrideAgent] = useState(null);
  const [overrideType, setOverrideType] = useState('');
  const [overrideRoute, setOverrideRoute] = useState('');
  const [overrideNote, setOverrideNote] = useState('');
  const [overrides, setOverrides] = useState({});

  const selected = agents.find(a => a.id === selectedAgentId) || subThreshold[0];

  const routed = Object.keys(routingResults).length;
  const overrideCount = Object.keys(overrides).length;
  const agreementRate = routed > 0 ? Math.round(((routed - overrideCount) / routed) * 100) : null;

  const filtered = subThreshold.filter(a => {
    if (filter === 'unrouted') return !routingResults[a.id];
    if (filter === 'low_confidence') return routingResults[a.id] && routingResults[a.id].confidence < 0.7;
    return true;
  });

  const routeStatus = (a) => {
    if (overrides[a.id]) return 'override';
    if (routingResults[a.id]) return 'routed';
    return 'undiagnosed';
  };

  const statusPill = (a) => {
    const s = routeStatus(a);
    if (s === 'routed') {
      const r = routingResults[a.id];
      if (r.confidence < 0.65) return <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800">Needs review</span>;
      return <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-800">Routed</span>;
    }
    if (s === 'override') return <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">Overridden</span>;
    return <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">Not yet diagnosed</span>;
  };

  const LOADING_MSGS = ['Reading recent calls…', 'Scanning trajectory…', 'Classifying issue type…'];

  async function runDiagnosis(agent) {
    setDiagnosing(true);
    setDiagError(null);
    let msgIdx = 0;
    setLoadingMsg(LOADING_MSGS[0]);
    const interval = setInterval(() => {
      msgIdx = (msgIdx + 1) % LOADING_MSGS.length;
      setLoadingMsg(LOADING_MSGS[msgIdx]);
    }, 1200);

    const systemPrompt = `You are a contact center performance analyst. Your job is to diagnose why a specific agent is performing below their CPS threshold by analyzing their recent call data, performance metrics, and 7-day trajectory.

Classify the root cause as exactly one of these issue types:
- "onboarding": agent tenure under 3 months, wide metric variance, still learning fundamentals
- "knowledge": repeated errors on the same topic or product area across multiple calls — the agent consistently mishandles the same type of situation
- "policy": compliance flags, policy misstatements, or regulatory issues appearing in call flags
- "logistics": tool or system friction — high AHT without corresponding quality issues, transfer loops, transcripts mentioning system problems
- "personal": sudden trajectory break with no prior pattern — CPS drops sharply over a short window with no metric-level explanation
- "motivational": Goodhart signal — call quality score high but CSAT low, suggesting the agent is optimizing for scored behaviors at the expense of actual customer outcomes
- "none": agent is performing adequately; no clear root cause for sub-threshold status

Routing rules (apply these exactly):
- "knowledge" or "onboarding" at confidence >= 0.65 → "automated_coaching"
- "knowledge" or "onboarding" at confidence < 0.65 → "supervisor_direct"
- "personal" → "supervisor_direct" always
- "policy" → "supervisor_direct" always
- "logistics" → "ops_escalation" always
- "motivational" → "supervisor_direct" always
- Any issue type at confidence < 0.55 → "supervisor_direct" regardless

Each evidence item must reference a specific call_id from the agent's data. Do not produce generic observations that could apply to any agent.

Respond with raw JSON only. No markdown fences, no preamble, no explanation outside the JSON.`;

    const userPrompt = `Diagnose the following agent's performance issue and return a JSON diagnosis.

Agent: ${agent.name} | Tenure: ${agent.tenure_months} months | CPS: ${agent.cps} / 100 (threshold: ${agent.cps_threshold})

7-day CPS trend (oldest to newest): ${agent.cps_trend_7d.join(', ')}

Performance metrics vs. threshold:
- CSAT: ${agent.metrics.csat}
- First Call Resolution: ${agent.metrics.fcr}%
- Average Handle Time: ${agent.metrics.aht_seconds}s
- Escalation Rate: ${agent.metrics.escalation_rate}%
- Compliance Score: ${agent.metrics.compliance_score}
- Call Quality: ${agent.metrics.call_quality}

Recent calls:
${agent.recent_calls.map(c =>
  `[${c.call_id}] ${c.date} | ${c.duration_seconds}s | Intent: ${c.intent} | Outcome: ${c.outcome}
Transcript: ${c.transcript_excerpt}
Flags: ${c.flags.join(', ') || 'none'}`
).join('\n\n')}

Return this JSON schema exactly:
{
  "issue_type": "onboarding" | "knowledge" | "policy" | "logistics" | "personal" | "motivational" | "none",
  "confidence": 0.0-1.0,
  "evidence": ["cite call_id and specific behavior", "cite call_id and specific behavior", "cite call_id and specific behavior"],
  "recommended_route": "automated_coaching" | "supervisor_direct" | "ops_escalation",
  "reasoning": "2-3 sentences explaining your diagnosis and routing decision"
}`;

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 1000,
          system: systemPrompt,
          messages: [{ role: 'user', content: userPrompt }],
        }),
      });
      if (!res.ok) throw new Error(`API error ${res.status}`);
      const data = await res.json();
      let raw = data.content[0].text.trim();
      raw = raw.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();
      const parsed = JSON.parse(raw);
      setRoutingResults(prev => ({ ...prev, [agent.id]: parsed }));
    } catch (e) {
      setDiagError(e.message || 'Parse error');
    } finally {
      clearInterval(interval);
      setDiagnosing(false);
    }
  }

  function acceptRoute(agent, result) {
    setRoutingResults(prev => ({ ...prev, [agent.id]: { ...result, accepted: true } }));
  }

  function submitOverride(agentId) {
    setOverrides(prev => ({ ...prev, [agentId]: { issue_type: overrideType, recommended_route: overrideRoute, note: overrideNote } }));
    setRoutingResults(prev => ({ ...prev, [agentId]: { ...(prev[agentId] || {}), recommended_route: overrideRoute, issue_type: overrideType, accepted: true, overridden: true } }));
    setOverrideAgent(null);
    setOverrideType(''); setOverrideRoute(''); setOverrideNote('');
  }

  const result = routingResults[selected?.id];
  const ic = selected ? ISSUE_COLORS[result?.issue_type || 'none'] : null;

  return (
    <div className="flex h-full">
      {/* Agent list */}
      <div className="w-56 flex-shrink-0 border-r border-gray-200 flex flex-col">
        {/* Filter */}
        <div className="p-3 border-b border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-600">Sub-threshold agents</span>
            {agreementRate !== null && (
              <span className="text-xs text-gray-500">Agreement: <span className="font-semibold text-gray-800">{agreementRate}%</span></span>
            )}
          </div>
          <select value={filter} onChange={e => setFilter(e.target.value)}
            className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-400">
            <option value="all">All sub-threshold</option>
            <option value="unrouted">Unrouted</option>
            <option value="low_confidence">Low confidence</option>
          </select>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filtered.map(a => (
            <button key={a.id} onClick={() => setSelectedAgentId(a.id)}
              className={`w-full text-left px-3 py-2.5 border-b border-gray-100 transition-colors ${selectedAgentId === a.id ? 'bg-blue-50' : 'hover:bg-gray-50'}`}>
              <div className="flex items-center justify-between gap-1">
                <span className="text-sm font-medium text-gray-800 truncate">{a.name}</span>
                <CpsBadge cps={a.cps} />
              </div>
              <div className="mt-0.5">{statusPill(a)}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Diagnostic panel */}
      {selected && (
        <div className="flex-1 overflow-y-auto p-6">
          {/* Agent header */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{selected.name}</h2>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-sm text-gray-500">{selected.tenure_months} months tenure</span>
                <CpsBadge cps={selected.cps} size="lg" />
                <span className="text-sm text-gray-400">/ {selected.cps_threshold} threshold</span>
              </div>
            </div>
            <div className="w-32 h-12">
              <Sparkline data={selected.cps_trend_7d} height={48} />
            </div>
          </div>

          {/* Metrics grid */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {Object.entries(selected.metrics).map(([k, v]) => {
              const labels = { csat:'CSAT', fcr:'FCR %', aht_seconds:'AHT (s)', escalation_rate:'Escalation %', compliance_score:'Compliance', call_quality:'Call Quality' };
              const ok = k === 'aht_seconds' ? v < 400 : v >= 75;
              return (
                <div key={k} className="bg-gray-50 rounded-lg p-2.5 border border-gray-100">
                  <div className="text-xs text-gray-500">{labels[k]}</div>
                  <div className={`text-base font-bold mt-0.5 ${ok ? 'text-gray-800' : 'text-red-600'}`}>{v}</div>
                </div>
              );
            })}
          </div>

          {/* Recent calls */}
          <div className="mb-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Recent Calls</h3>
            <div className="space-y-2">
              {selected.recent_calls.map(c => (
                <div key={c.call_id} className="border border-gray-200 rounded-lg overflow-hidden">
                  <button onClick={() => setExpandedCall(expandedCall === c.call_id ? null : c.call_id)}
                    className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 transition-colors">
                    <span className="text-xs font-mono text-gray-500">{c.call_id}</span>
                    <span className="text-xs text-gray-600">{c.intent}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded ${c.outcome === 'resolved' ? 'bg-green-100 text-green-700' : c.outcome === 'escalated' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>{c.outcome}</span>
                    <span className="text-xs text-gray-400 ml-auto">{c.duration_seconds}s</span>
                    {c.flags.length > 0 && <span className="text-xs text-amber-600">⚠ {c.flags.length}</span>}
                  </button>
                  {expandedCall === c.call_id && (
                    <div className="border-t border-gray-100 p-3 bg-gray-50">
                      <p className="text-xs text-gray-700 italic mb-2">"{c.transcript_excerpt}"</p>
                      {c.flags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {c.flags.map((f, i) => (
                            <span key={i} className="text-xs bg-amber-50 text-amber-700 border border-amber-200 rounded px-1.5 py-0.5">{f}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Diagnosis result or button */}
          {!result ? (
            <div>
              {diagError && (
                <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
                  {diagError} — <button onClick={() => setDiagError(null)} className="underline">Retry</button>
                </div>
              )}
              <button onClick={() => runDiagnosis(selected)} disabled={diagnosing}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white rounded-lg py-3 text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 transition-colors">
                {diagnosing ? <><span className="animate-spin">⟳</span> {loadingMsg}</> : 'Run Diagnosis'}
              </button>
            </div>
          ) : (
            <div className="border border-gray-200 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <span className={`text-sm font-bold px-3 py-1 rounded-full ${ic.pill}`}>
                  {result.issue_type}
                </span>
                <span className={`text-xs px-2 py-1 rounded-full ${ROUTE_COLORS[result.recommended_route]}`}>
                  → {ROUTE_LABELS[result.recommended_route]}
                </span>
              </div>

              {/* Confidence bar */}
              <div className="mb-3">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Confidence</span>
                  <span className="font-semibold">{Math.round(result.confidence * 100)}%</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${result.confidence >= 0.65 ? 'bg-green-500' : 'bg-yellow-400'}`}
                    style={{ width: `${result.confidence * 100}%` }} />
                </div>
              </div>

              {/* Evidence */}
              <div className="mb-3">
                <div className="text-xs font-semibold text-gray-500 mb-1">Evidence</div>
                <ul className="space-y-1">
                  {result.evidence.map((e, i) => (
                    <li key={i} className="flex gap-2 text-xs text-gray-700">
                      <span className="text-gray-400 flex-shrink-0">•</span>
                      <span>{e}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Reasoning */}
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="text-xs font-semibold text-gray-500 mb-1">Reasoning</div>
                <p className="text-xs text-gray-700">{result.reasoning}</p>
              </div>

              {/* Actions */}
              {!result.accepted ? (
                <div className="flex gap-2">
                  <button onClick={() => acceptRoute(selected, result)}
                    className="flex-1 bg-blue-600 text-white text-sm font-medium rounded-lg py-2 hover:bg-blue-700 transition-colors">
                    Accept and Route
                  </button>
                  <button onClick={() => setOverrideAgent(selected.id)}
                    className="px-4 border border-gray-300 text-sm text-gray-700 rounded-lg py-2 hover:bg-gray-50 transition-colors">
                    Override
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-xs text-green-700 font-medium">
                    {result.overridden ? '✓ Override applied' : '✓ Routed: ' + ROUTE_LABELS[result.recommended_route]}
                  </div>
                  {result.recommended_route === 'automated_coaching' && (
                    <button onClick={() => onGoToPlan(selected.id)}
                      className="w-full flex items-center justify-center gap-1.5 bg-purple-600 text-white text-sm font-medium rounded-lg py-2 hover:bg-purple-700 transition-colors">
                      Generate Coaching Plan →
                    </button>
                  )}
                  {result.recommended_route === 'ops_escalation' && (
                    <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg text-xs text-orange-700">
                      ✓ Ticket created for Ops — tooling issue logged for investigation
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Override modal */}
          {overrideAgent === selected.id && (
            <div className="mt-4 border border-purple-200 rounded-xl p-4 bg-purple-50">
              <h4 className="text-sm font-semibold text-gray-800 mb-3">Override Routing</h4>
              <div className="space-y-2 mb-3">
                <select value={overrideType} onChange={e => setOverrideType(e.target.value)}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-blue-400">
                  <option value="">Select issue type…</option>
                  {['onboarding','knowledge','policy','logistics','personal','motivational'].map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                <select value={overrideRoute} onChange={e => setOverrideRoute(e.target.value)}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-blue-400">
                  <option value="">Select route…</option>
                  <option value="automated_coaching">Automated Coaching</option>
                  <option value="supervisor_direct">Supervisor Direct</option>
                  <option value="ops_escalation">Ops Escalation</option>
                </select>
                <textarea value={overrideNote} onChange={e => setOverrideNote(e.target.value)}
                  placeholder="Required: reason for override…"
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 resize-none h-16 focus:outline-none focus:ring-1 focus:ring-blue-400" />
              </div>
              <div className="flex gap-2">
                <button onClick={() => submitOverride(selected.id)}
                  disabled={!overrideType || !overrideRoute || !overrideNote.trim()}
                  className="flex-1 bg-purple-600 text-white text-sm font-medium rounded-lg py-2 disabled:opacity-40 hover:bg-purple-700 transition-colors">
                  Apply Override
                </button>
                <button onClick={() => setOverrideAgent(null)}
                  className="px-4 border border-gray-300 text-sm text-gray-700 rounded-lg py-2 hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── TAB 3: COACHING PLANS ────────────────────────────────────────────────────

function Tab3Plans({ agents, apiKey, routingResults, plans, setPlans, onCpsBump, selectedPlanAgentId, setSelectedPlanAgentId }) {
  const eligible = agents.filter(a => {
    const r = routingResults[a.id];
    return r && r.recommended_route === 'automated_coaching' && r.accepted;
  });

  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState(null);
  const [genMsg, setGenMsg] = useState('');
  const [expandedCall, setExpandedCall] = useState(null);
  const [expandedDevin, setExpandedDevin] = useState(false);

  const selected = agents.find(a => a.id === selectedPlanAgentId) || eligible[0];
  const plan = selected ? plans[selected.id] : null;
  const diagResult = selected ? routingResults[selected.id] : null;

  const GEN_MSGS = ['Grounding in specific calls…', 'Drafting behavioral targets…', 'Writing practice drills…'];

  async function generatePlan(agent) {
    setGenerating(true);
    setGenError(null);
    setExpandedDevin(false);
    let msgIdx = 0;
    setGenMsg(GEN_MSGS[0]);
    const interval = setInterval(() => {
      msgIdx = (msgIdx + 1) % GEN_MSGS.length;
      setGenMsg(GEN_MSGS[msgIdx]);
    }, 1400);

    const diagR = routingResults[agent.id];

    const systemPrompt = `You are a contact center coaching specialist. Your job is to write a specific, actionable coaching plan for an agent based on a confirmed diagnosis and their actual call transcripts.

CRITICAL REQUIREMENT — GROUNDED SPECIFICITY: Every focus area must cite at least one specific call_id from the agent's recent calls and describe a specific observable behavior from that call. You are forbidden from writing generic coaching advice such as "improve your empathy," "listen more carefully," or "handle objections better." If you cannot ground a coaching action in a specific call moment from the data provided, do not include it.

Tone: write in second person (you, your) with a developmental, non-punitive framing. The agent should feel supported and capable of improving, not evaluated or judged.

Quantity: include 2-3 focus areas only. Fewer, well-grounded areas are more effective than many generic ones. Do not pad.

Length: keep each text field under 60 words. Be direct and specific — brevity is a feature, not a limitation.

Respond with raw JSON only. No markdown fences, no preamble, no explanation outside the JSON.`;

    const userPrompt = `Write a contextual coaching plan for the following agent.

Agent: ${agent.name} | Tenure: ${agent.tenure_months} months | CPS: ${agent.cps} / 100 (threshold: ${agent.cps_threshold})

Confirmed diagnosis:
- Issue type: ${diagR.issue_type}
- Evidence from diagnosis:
${(diagR.evidence || []).map(e => `  • ${e}`).join('\n')}

Recent calls (the only calls you may reference):
${agent.recent_calls.map(c =>
  `[${c.call_id}] ${c.date} | ${c.duration_seconds}s | Intent: ${c.intent} | Outcome: ${c.outcome}
Transcript: ${c.transcript_excerpt}
Flags: ${c.flags.join(', ') || 'none'}`
).join('\n\n')}

Return this JSON schema exactly:
{
  "plan_title": "short descriptive title specific to this agent's situation",
  "diagnosis_summary": "1-2 sentences describing what the data shows, framed developmentally",
  "focus_areas": [
    {
      "area": "short label for this skill or behavior area",
      "grounded_in_calls": ["call_id"],
      "observed_behavior": "what you specifically did on those calls — describe the observable action, not a judgment",
      "target_behavior": "what to do next time — specific, observable, and something a manager could verify by listening to a call",
      "practice_drill": "a concrete 2-minute drill you can do between calls to build this skill"
    }
  ],
  "next_checkpoint": "what your supervisor will listen for in your next 5 calls to measure progress"
}`;

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 4000,
          system: systemPrompt,
          messages: [{ role: 'user', content: userPrompt }],
        }),
      });
      if (!res.ok) throw new Error(`API error ${res.status}`);
      const data = await res.json();
      let raw = data.content[0].text.trim();
      raw = raw.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();
      const parsed = JSON.parse(raw);
      setPlans(prev => ({ ...prev, [agent.id]: parsed }));
    } catch (e) {
      setGenError(e.message || 'Parse error');
    } finally {
      clearInterval(interval);
      setGenerating(false);
    }
  }

  function approvePlan(agentId) {
    setPlans(prev => ({ ...prev, [agentId]: { ...prev[agentId], approved: true } }));
    onCpsBump(agentId, 8);
    setExpandedDevin(true);
  }

  return (
    <div className="flex h-full">
      {/* Agent list */}
      <div className="w-52 flex-shrink-0 border-r border-gray-200 flex flex-col">
        <div className="p-3 border-b border-gray-100">
          <span className="text-xs font-medium text-gray-600">Automated coaching track</span>
        </div>
        {eligible.length === 0 ? (
          <div className="flex-1 p-4 flex items-center justify-center">
            <div className="text-center">
              <div className="text-xs text-gray-400 leading-relaxed">No coaching plans yet.<br />Plans appear here after an agent is routed to automated coaching in the Router tab.</div>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            {eligible.map(a => {
              const p = plans[a.id];
              return (
                <button key={a.id} onClick={() => setSelectedPlanAgentId(a.id)}
                  className={`w-full text-left px-3 py-2.5 border-b border-gray-100 transition-colors ${selectedPlanAgentId === a.id ? 'bg-blue-50' : 'hover:bg-gray-50'}`}>
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-sm font-medium text-gray-800 truncate">{a.name}</span>
                    <CpsBadge cps={a.cps} />
                  </div>
                  <div className="mt-0.5">
                    {p?.approved
                      ? <span className="text-xs text-green-600">✓ Sent to agent</span>
                      : p
                      ? <span className="text-xs text-purple-600">Plan ready</span>
                      : <span className="text-xs text-gray-400">Pending plan</span>}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Plan detail */}
      {selected && (
        <div className="flex-1 overflow-y-auto p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{selected.name}</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <CpsBadge cps={selected.cps} />
                <span className="text-sm text-gray-400">/ {selected.cps_threshold} threshold</span>
                {diagResult && (
                  <span className={`text-xs px-2 py-0.5 rounded-full ${ISSUE_COLORS[diagResult.issue_type]?.pill}`}>
                    {diagResult.issue_type}
                  </span>
                )}
              </div>
            </div>
          </div>

          {!plan ? (
            <div>
              {genError && (
                <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
                  {genError} — <button onClick={() => setGenError(null)} className="underline">Retry</button>
                </div>
              )}
              <button onClick={() => generatePlan(selected)} disabled={generating}
                className="w-full flex items-center justify-center gap-2 bg-purple-600 text-white rounded-lg py-3 text-sm font-semibold hover:bg-purple-700 disabled:opacity-60 transition-colors">
                {generating ? <><span className="animate-spin">⟳</span> {genMsg}</> : 'Generate Plan'}
              </button>
            </div>
          ) : (
            <div>
              {/* Plan header */}
              <div className="mb-4 p-4 bg-purple-50 border border-purple-100 rounded-xl">
                <h3 className="font-semibold text-gray-900 mb-1">{plan.plan_title}</h3>
                <p className="text-sm text-gray-700">{plan.diagnosis_summary}</p>
                <div className="mt-2 text-xs text-purple-700 font-medium">
                  Grounded in {plan.focus_areas?.reduce((acc, fa) => acc + (fa.grounded_in_calls?.length || 0), 0)} specific call{plan.focus_areas?.reduce((acc, fa) => acc + (fa.grounded_in_calls?.length || 0), 0) !== 1 ? 's' : ''}
                </div>
              </div>

              {/* Focus areas */}
              <div className="space-y-3 mb-4">
                {plan.focus_areas?.map((fa, i) => (
                  <div key={i} className="border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-sm font-semibold text-gray-800">{fa.area}</span>
                      <div className="flex gap-1">
                        {fa.grounded_in_calls?.map(cid => {
                          const call = selected.recent_calls.find(c => c.call_id === cid);
                          return (
                            <button key={cid} onClick={() => setExpandedCall(expandedCall === cid ? null : cid)}
                              className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded font-mono hover:bg-blue-200 transition-colors">
                              {cid}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Expanded call transcript */}
                    {fa.grounded_in_calls?.some(cid => expandedCall === cid) && (() => {
                      const cid = fa.grounded_in_calls.find(c => expandedCall === c);
                      const call = selected.recent_calls.find(c => c.call_id === cid);
                      return call ? (
                        <div className="mb-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                          <div className="text-xs font-mono text-gray-500 mb-1">{call.call_id} · {call.intent} · {call.outcome}</div>
                          <p className="text-xs text-gray-700 italic">"{call.transcript_excerpt}"</p>
                        </div>
                      ) : null;
                    })()}

                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div>
                        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">What happened</div>
                        <p className="text-xs text-gray-700">{fa.observed_behavior}</p>
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">What to do next time</div>
                        <p className="text-xs text-gray-700">{fa.target_behavior}</p>
                      </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                      <div className="text-xs font-semibold text-blue-700 mb-1">Practice drill</div>
                      <p className="text-xs text-blue-800">{fa.practice_drill}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Next checkpoint */}
              <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <div className="text-xs font-semibold text-gray-500 mb-1">Next checkpoint — what Maya will listen for</div>
                <p className="text-xs text-gray-700">{plan.next_checkpoint}</p>
              </div>

              {/* Actions */}
              {!plan.approved ? (
                <div className="flex gap-2">
                  <button onClick={() => approvePlan(selected.id)}
                    className="flex-1 bg-green-600 text-white text-sm font-semibold rounded-lg py-2.5 hover:bg-green-700 transition-colors">
                    Approve and Send to Agent
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-xs text-green-700 font-medium">
                    ✓ Plan sent to agent — CPS updated (+8 pts from coaching engagement)
                  </div>

                  {/* Devin preview */}
                  <div className="border border-gray-200 rounded-xl overflow-hidden">
                    <button onClick={() => setExpandedDevin(x => !x)}
                      className="w-full flex items-center justify-between p-3 hover:bg-gray-50 transition-colors">
                      <span className="text-sm font-medium text-gray-700">Preview: {selected.name.split(' ')[0]}'s view</span>
                      <span className="text-xs text-gray-400">{expandedDevin ? '▲' : '▼'}</span>
                    </button>
                    {expandedDevin && (
                      <div className="border-t border-gray-100 p-4 bg-gray-50">
                        <div className="text-xs text-gray-500 mb-3">This is what the agent sees:</div>
                        <div className="bg-white border border-gray-200 rounded-lg p-4">
                          <h4 className="font-semibold text-gray-900 mb-1">{plan.plan_title}</h4>
                          <p className="text-sm text-gray-700 mb-3">{plan.diagnosis_summary}</p>
                          {plan.focus_areas?.map((fa, i) => (
                            <div key={i} className="mb-3 border-l-2 border-blue-400 pl-3">
                              <div className="text-sm font-medium text-gray-800 mb-1">{fa.area}</div>
                              <p className="text-xs text-gray-600 mb-1">{fa.target_behavior}</p>
                              <div className="bg-blue-50 rounded p-2 text-xs text-blue-800">
                                <span className="font-medium">Your drill: </span>{fa.practice_drill}
                              </div>
                            </div>
                          ))}
                          <div className="mt-3 p-2 bg-gray-50 rounded text-xs text-gray-600">
                            <span className="font-medium">What Maya will check: </span>{plan.next_checkpoint}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── DEMO TOUR ────────────────────────────────────────────────────────────────

const TOUR_STEPS = [
  { tab: 'today',  heading: 'Step 1 of 7 — Maya\'s day starts here',     body: 'Six agents need her directly. Twelve are handled by the automated path. Maya\'s attention is already focused before she opens a single file.' },
  { tab: 'router', heading: 'Step 2 of 7 — Diagnosing before coaching',  body: 'Before coaching anyone, the system diagnoses what kind of problem this is. Personal? Knowledge gap? Tooling failure? The answer changes everything.' },
  { tab: 'router', heading: 'Step 3 of 7 — Agentic call (live)',         body: 'Click Run Diagnosis. Claude is reading the actual transcripts and scoring patterns — not a template. Watch it classify the issue type with evidence.' },
  { tab: 'router', heading: 'Step 4 of 7 — Accept and Route',            body: 'Accept routes the agent to automated coaching. The system handles the next step. Maya stays out of it — unless she disagrees.' },
  { tab: 'plans',  heading: 'Step 5 of 7 — Generate the plan',           body: 'Click Generate Plan. Every coaching action will cite a specific call ID and observable behavior. No generic tips. This is what makes coaching work at 1:50.' },
  { tab: 'plans',  heading: 'Step 6 of 7 — The agent\'s view',           body: 'After approving, see what the agent actually receives: second-person, developmental, practice drills front and center.' },
  { tab: 'today',  heading: 'Step 7 of 7 — The loop closes',             body: 'Return to Today. One more agent above threshold. Maya\'s queue shrinks. Her attention stays on what only she can do.' },
];

function DemoTour({ step, setStep, setActiveTab }) {
  if (step === null) return null;
  const s = TOUR_STEPS[step - 1];
  return (
    <div className="fixed bottom-6 right-6 z-50 w-80 bg-gray-900 text-white rounded-2xl shadow-2xl p-5">
      <div className="flex items-start justify-between mb-2">
        <span className="text-xs text-gray-400 font-medium">{s.heading}</span>
        <button onClick={() => setStep(null)} className="text-gray-500 hover:text-gray-300 ml-2 text-sm leading-none">✕</button>
      </div>
      <p className="text-sm text-gray-200 leading-relaxed mb-4">{s.body}</p>
      <div className="flex items-center justify-between">
        <div className="flex gap-1">
          {TOUR_STEPS.map((_, i) => (
            <div key={i} className={`h-1 rounded-full transition-all ${i === step - 1 ? 'w-4 bg-blue-400' : 'w-1.5 bg-gray-600'}`} />
          ))}
        </div>
        <div className="flex gap-2">
          {step > 1 && (
            <button onClick={() => { setStep(step - 1); setActiveTab(TOUR_STEPS[step - 2].tab); }}
              className="text-xs text-gray-400 hover:text-gray-200 transition-colors">Back</button>
          )}
          {step < TOUR_STEPS.length ? (
            <button onClick={() => { setStep(step + 1); setActiveTab(TOUR_STEPS[step].tab); }}
              className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-500 transition-colors">Next →</button>
          ) : (
            <button onClick={() => setStep(null)}
              className="text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-500 transition-colors">Done</button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── APP ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [apiKey, setApiKey] = useState('');
  const [activeTab, setActiveTab] = useState('today');
  const [routingResults, setRoutingResults] = useState({});
  const [plans, setPlans] = useState({});
  const [demoStep, setDemoStep] = useState(null);
  const [selectedAgentId, setSelectedAgentId] = useState(null);
  const [selectedPlanAgentId, setSelectedPlanAgentId] = useState(null);
  const [cpsBumps, setCpsBumps] = useState({});

  const agents = useMemo(() =>
    AGENTS.map(a => ({ ...a, cps: a.cps + (cpsBumps[a.id] || 0) })),
    [cpsBumps]
  );

  function onCpsBump(agentId, delta) {
    setCpsBumps(prev => ({ ...prev, [agentId]: (prev[agentId] || 0) + delta }));
  }

  function onOpenAgent(agentId) {
    setSelectedAgentId(agentId);
    setActiveTab('router');
  }

  function onGoToPlan(agentId) {
    setSelectedPlanAgentId(agentId);
    setActiveTab('plans');
  }

  function startTour() {
    setDemoStep(1);
    setActiveTab(TOUR_STEPS[0].tab);
    const queue = buildQueue(agents);
    if (queue.length > 0) setSelectedAgentId(queue[0].id);
  }

  if (!apiKey) return <ApiKeyModal onSubmit={setApiKey} />;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 flex items-center">
        <div className="px-5 py-3.5 font-semibold text-gray-900 text-sm border-r border-gray-200 whitespace-nowrap">
          Coaching Command Center
        </div>
        {[['today','Today'],['router','Router'],['plans','Coaching Plans']].map(([id, label]) => (
          <button key={id} onClick={() => setActiveTab(id)}
            className={`px-5 py-3.5 text-sm font-medium border-b-2 transition-colors ${activeTab === id ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            {label}
          </button>
        ))}
      </header>

      <div className="flex flex-1 overflow-hidden" style={{ height: 'calc(100vh - 48px)' }}>
        <LeftRail agents={agents} onStartTour={startTour} activeTab={activeTab} setActiveTab={setActiveTab} />
        <main className="flex-1 overflow-auto">
          {activeTab === 'today' && (
            <Tab1Today agents={agents} routingResults={routingResults} onOpenAgent={onOpenAgent} />
          )}
          {activeTab === 'router' && (
            <Tab2Router
              agents={agents} apiKey={apiKey}
              routingResults={routingResults} setRoutingResults={setRoutingResults}
              onGoToPlan={onGoToPlan}
              selectedAgentId={selectedAgentId} setSelectedAgentId={setSelectedAgentId}
            />
          )}
          {activeTab === 'plans' && (
            <Tab3Plans
              agents={agents} apiKey={apiKey}
              routingResults={routingResults}
              plans={plans} setPlans={setPlans}
              onCpsBump={onCpsBump}
              selectedPlanAgentId={selectedPlanAgentId} setSelectedPlanAgentId={setSelectedPlanAgentId}
            />
          )}
        </main>
      </div>

      <DemoTour step={demoStep} setStep={setDemoStep} setActiveTab={setActiveTab} />
    </div>
  );
}
