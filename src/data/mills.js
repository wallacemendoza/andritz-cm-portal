// Mill configuration data
export const MILLS = {
  'clearwater-augusta': {
    id: 'clearwater-augusta',
    name: 'Clearwater Paper',
    shortName: 'CWP Augusta',
    location: 'Augusta, GA',
    client: 'Clearwater Paper',
    color: '#00c8ff',
    accentColor: '#0090cc',
    areas: {
      pulp: {
        name: 'Pulp',
        subareas: {
          'pulp-2': { name: 'Pulp 2', floors: ['Ground Floor', 'Upper Floor'] },
          'pulp-3': {
            name: 'Pulp 3',
            floors: ['Ground Floor 1', 'Outside', 'Ground Floor 2', '5th Floor', 'Bleach Floor', '6th Floor / Roof']
          },
          'chemical': { name: 'Chemical Area', floors: ['Ground Floor', 'Upper Level'] },
          'lime-kiln': { name: 'Lime Kiln', floors: ['Ground Level', 'Platform'] },
          'woodyard': { name: 'Woodyard', floors: ['Ground Level'] }
        }
      },
      power: {
        name: 'Power',
        subareas: {
          'boiler': { name: 'Boiler House', floors: ['Ground Floor', 'Mid Level', 'Top Level'] },
          'turbine': { name: 'Turbine Hall', floors: ['Ground Floor'] }
        }
      },
      pm1: {
        name: 'PM1',
        subareas: {
          'wet-end': { name: 'Wet End', floors: ['Ground Floor', 'Mezzanine'] },
          'dry-end': { name: 'Dry End', floors: ['Ground Floor', 'Mezzanine'] }
        }
      },
      pm3: {
        name: 'PM3',
        subareas: {
          'wet-end': { name: 'Wet End', floors: ['Ground Floor', 'Mezzanine'] },
          'dry-end': { name: 'Dry End', floors: ['Ground Floor', 'Mezzanine'] }
        }
      }
    }
  },
  'gpi-macon': {
    id: 'gpi-macon',
    name: 'Graphic Packaging International',
    shortName: 'GPI Macon',
    location: 'Macon, GA',
    client: 'Graphic Packaging International',
    color: '#ff6b35',
    accentColor: '#cc4400',
    areas: {
      pm1: {
        name: 'PM1',
        subareas: {
          'mezzanine': { name: 'Mezzanine', floors: ['Level 1', 'Level 2'] },
          'basement': { name: 'Basement', floors: ['Ground'] },
          'drive-side': { name: 'Drive Side', floors: ['Floor 1', 'Floor 2'] }
        }
      },
      utilities: {
        name: 'Utilities',
        subareas: {
          'air-compressors': { name: 'Air Compressors', floors: ['Ground Floor'] },
          'water-treatment': { name: 'Water Treatment', floors: ['Ground Floor'] }
        }
      }
    },
    reports: [
      {
        id: 'CMR-002-2026',
        date: '2026-02-13',
        location: 'PM1 > Mezzanine > 1 IR DRY EXHAUST FAN > ODE',
        asset: 'Fan - 0033-PAPR-PM01-1CIRDR-0322',
        status: 'caution',
        vibrationLevel: '14.4 gE',
        risk: 'medium',
        diagnosis: 'Mechanical looseness',
        recommendation: 'Confirm if it\'s possible to adjust bearing clearance. Replace fan bearings.',
        emittedBy: 'Uanderson Bicudo'
      }
    ]
  },
  'newindy-catawba': {
    id: 'newindy-catawba',
    name: 'New Indy Container Board',
    shortName: 'New Indy Catawba',
    location: 'Catawba, SC',
    client: 'New Indy Container Board',
    color: '#00ff88',
    accentColor: '#00bb66',
    areas: {
      pm1: {
        name: 'PM1',
        subareas: {
          'wet-end': { name: 'Wet End', floors: ['Ground Floor', 'Mezzanine'] },
          'press-section': { name: 'Press Section', floors: ['Ground Floor'] },
          'dry-end': { name: 'Dry End', floors: ['Ground Floor', 'Mezzanine'] }
        }
      },
      'stock-prep': {
        name: 'Stock Prep',
        subareas: {
          'refiners': { name: 'Refiners', floors: ['Ground Floor'] },
          'cleaners': { name: 'Cleaners', floors: ['Ground Floor', 'Upper'] }
        }
      }
    }
  }
};

export const FORM_TYPES = [
  { id: 'condition-monitor', name: 'Condition Monitor Form', icon: '📊' },
  { id: 'post-maintenance', name: 'Post Maintenance Form', icon: '🔧' },
  { id: 'rcfa', name: 'RCFA Form', icon: '🔍' },
  { id: 'safety', name: 'Safety Form', icon: '🛡️' }
];

export const STATUS_OPTIONS = ['open', 'in-progress', 'completed', 'on-hold'];
export const PRIORITY_OPTIONS = ['low', 'medium', 'high', 'critical'];
export const RISK_OPTIONS = ['low', 'medium', 'high', 'critical'];
