import { createContext, useContext } from 'react'

const defaultPermissions = {
  text:       { enabled: true, allow_add: true },
  image:      { enabled: true, allow_add: true },
  shape:      { enabled: true, allow_add: true },
  background: { enabled: true }
}

export const PermissionsContext = createContext(defaultPermissions)

export function PermissionsProvider({ permissions, children }) {
  return (
    <PermissionsContext.Provider value={permissions || defaultPermissions}>
      {children}
    </PermissionsContext.Provider>
  )
}

export function usePermissions() {
  return useContext(PermissionsContext)
}
