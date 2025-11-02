/**
 * Mock ZIP Code Data
 * Used for SearchInput component autocomplete demonstration
 */

export interface ZipCodeData {
  zip: string
  city: string
  state: string
  stateAbbr: string
}

export const mockZipCodes: ZipCodeData[] = [
  // New York
  { zip: '10001', city: 'New York', state: 'New York', stateAbbr: 'NY' },
  { zip: '10002', city: 'New York', state: 'New York', stateAbbr: 'NY' },
  { zip: '10003', city: 'New York', state: 'New York', stateAbbr: 'NY' },
  { zip: '11201', city: 'Brooklyn', state: 'New York', stateAbbr: 'NY' },
  { zip: '11101', city: 'Long Island City', state: 'New York', stateAbbr: 'NY' },

  // California
  { zip: '90001', city: 'Los Angeles', state: 'California', stateAbbr: 'CA' },
  { zip: '90210', city: 'Beverly Hills', state: 'California', stateAbbr: 'CA' },
  { zip: '94102', city: 'San Francisco', state: 'California', stateAbbr: 'CA' },
  { zip: '92101', city: 'San Diego', state: 'California', stateAbbr: 'CA' },
  { zip: '95101', city: 'San Jose', state: 'California', stateAbbr: 'CA' },

  // Texas
  { zip: '75201', city: 'Dallas', state: 'Texas', stateAbbr: 'TX' },
  { zip: '77001', city: 'Houston', state: 'Texas', stateAbbr: 'TX' },
  { zip: '78701', city: 'Austin', state: 'Texas', stateAbbr: 'TX' },
  { zip: '78201', city: 'San Antonio', state: 'Texas', stateAbbr: 'TX' },

  // Florida
  { zip: '33101', city: 'Miami', state: 'Florida', stateAbbr: 'FL' },
  { zip: '33301', city: 'Fort Lauderdale', state: 'Florida', stateAbbr: 'FL' },
  { zip: '32801', city: 'Orlando', state: 'Florida', stateAbbr: 'FL' },
  { zip: '33602', city: 'Tampa', state: 'Florida', stateAbbr: 'FL' },

  // Illinois
  { zip: '60601', city: 'Chicago', state: 'Illinois', stateAbbr: 'IL' },
  { zip: '60602', city: 'Chicago', state: 'Illinois', stateAbbr: 'IL' },

  // Pennsylvania
  { zip: '19101', city: 'Philadelphia', state: 'Pennsylvania', stateAbbr: 'PA' },
  { zip: '15201', city: 'Pittsburgh', state: 'Pennsylvania', stateAbbr: 'PA' },

  // Arizona
  { zip: '85001', city: 'Phoenix', state: 'Arizona', stateAbbr: 'AZ' },
  { zip: '85701', city: 'Tucson', state: 'Arizona', stateAbbr: 'AZ' },

  // Washington
  { zip: '98101', city: 'Seattle', state: 'Washington', stateAbbr: 'WA' },
  { zip: '99201', city: 'Spokane', state: 'Washington', stateAbbr: 'WA' },

  // Massachusetts
  { zip: '02101', city: 'Boston', state: 'Massachusetts', stateAbbr: 'MA' },
  { zip: '02139', city: 'Cambridge', state: 'Massachusetts', stateAbbr: 'MA' },

  // Colorado
  { zip: '80201', city: 'Denver', state: 'Colorado', stateAbbr: 'CO' },
  { zip: '80901', city: 'Colorado Springs', state: 'Colorado', stateAbbr: 'CO' },
]

