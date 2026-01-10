export const lightTheme = {
  token: {
    // Colores principales - Paleta moderna y vibrante
    colorPrimary: '#6366f1',      // Indigo vibrante
    colorSuccess: '#10b981',      // Verde esmeralda
    colorWarning: '#f59e0b',      // Ámbar
    colorError: '#ef4444',        // Rojo moderno
    colorInfo: '#06b6d4',         // Cyan
    
    // Tipografía
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontSize: 14,
    fontSizeHeading1: 32,
    fontSizeHeading2: 28,
    fontSizeHeading3: 24,
    fontSizeHeading4: 20,
    fontSizeHeading5: 16,
    
    // Bordes y esquinas
    borderRadius: 12,
    borderRadiusLG: 16,
    borderRadiusSM: 8,
    borderRadiusXS: 6,
    
    // Fondos
    colorBgBase: '#ffffff',
    colorBgContainer: '#ffffff',
    colorBgElevated: '#ffffff',
    colorBgLayout: '#f8fafc',
    colorBgSpotlight: '#f1f5f9',
    
    // Bordes
    colorBorder: '#e2e8f0',
    colorBorderSecondary: '#f1f5f9',
    
    // Textos
    colorText: '#0f172a',
    colorTextSecondary: '#64748b',
    colorTextTertiary: '#94a3b8',
    colorTextQuaternary: '#cbd5e1',
    
    // Sombras
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    boxShadowSecondary: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    
    // Espaciado
    padding: 16,
    paddingLG: 24,
    paddingXL: 32,
    paddingSM: 12,
    paddingXS: 8,
    
    // Animaciones
    motionDurationFast: '0.1s',
    motionDurationMid: '0.2s',
    motionDurationSlow: '0.3s',
  },
  components: {
    Button: {
      borderRadius: 10,
      controlHeight: 44,
      fontWeight: 600,
      primaryShadow: '0 4px 14px rgba(99, 102, 241, 0.25)',
      defaultShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
      dangerShadow: '0 4px 14px rgba(239, 68, 68, 0.25)',
      paddingContentHorizontal: 20,
    },
    Input: {
      borderRadius: 10,
      controlHeight: 44,
      paddingSM: 12,
      activeBorderColor: '#6366f1',
      hoverBorderColor: '#a5b4fc',
      activeShadow: '0 0 0 3px rgba(99, 102, 241, 0.1)',
    },
    Select: {
      borderRadius: 10,
      controlHeight: 44,
      optionSelectedBg: '#eef2ff',
      optionActiveBg: '#f5f7ff',
    },
    Card: {
      borderRadius: 16,
      paddingLG: 24,
      boxShadowTertiary: '0 4px 6px -1px rgba(0, 0, 0, 0.06), 0 2px 4px -1px rgba(0, 0, 0, 0.04)',
      headerBg: 'transparent',
      headerFontSize: 18,
      headerFontSizeSM: 16,
      headerHeight: 56,
    },
    Table: {
      borderRadius: 12,
      headerBg: '#f8fafc',
      headerColor: '#0f172a',
      headerSplitColor: '#e2e8f0',
      rowHoverBg: '#f1f5f9',
      borderColor: '#e2e8f0',
      headerBorderRadius: 12,
      cellPaddingBlock: 16,
      cellPaddingInline: 16,
    },
    Modal: {
      borderRadius: 16,
      headerBg: 'transparent',
      contentBg: '#ffffff',
      titleFontSize: 20,
      titleLineHeight: 1.5,
    },
    Badge: {
      colorSuccess: '#10b981',
      colorWarning: '#f59e0b',
      colorError: '#ef4444',
      textFontSize: 12,
      textFontWeight: 600,
    },
    Tag: {
      borderRadiusSM: 8,
      fontSizeSM: 13,
      defaultBg: '#f1f5f9',
      defaultColor: '#475569',
    },
    Tabs: {
      itemActiveColor: '#6366f1',
      itemHoverColor: '#818cf8',
      itemSelectedColor: '#6366f1',
      inkBarColor: '#6366f1',
      titleFontSize: 15,
    },
    Menu: {
      itemBorderRadius: 10,
      itemMarginBlock: 4,
      itemMarginInline: 8,
      itemPaddingInline: 16,
      itemHeight: 44,
      iconSize: 20,
      subMenuItemBg: 'transparent',
      darkItemBg: 'transparent',
      darkSubMenuItemBg: 'rgba(255, 255, 255, 0.04)',
      darkItemHoverBg: 'rgba(255, 255, 255, 0.08)',
      darkItemSelectedBg: 'rgba(99, 102, 241, 0.15)',
      darkItemSelectedColor: '#fff',
    },
    Layout: {
      bodyBg: '#f8fafc',
      headerBg: '#ffffff',
      headerHeight: 72,
      headerPadding: '0 32px',
      siderBg: '#1e293b',
      triggerBg: '#334155',
      triggerColor: '#ffffff',
    },
    Notification: {
      borderRadius: 12,
      width: 400,
    },
    Message: {
      borderRadius: 10,
      contentPadding: '12px 16px',
    },
    Popover: {
      borderRadius: 12,
    },
    Drawer: {
      borderRadius: 16,
    },
    Form: {
      labelFontSize: 14,
      labelColor: '#475569',
      labelRequiredMarkColor: '#ef4444',
      itemMarginBottom: 20,
    },
    Switch: {
      trackHeight: 24,
      trackMinWidth: 48,
      innerMinMargin: 4,
      innerMaxMargin: 6,
    },
    DatePicker: {
      borderRadius: 10,
      controlHeight: 44,
    },
    Upload: {
      borderRadius: 10,
    },
    Progress: {
      defaultColor: '#6366f1',
      remainingColor: '#e2e8f0',
    },
  },
};

export const darkTheme = {
  token: {
    // Colores principales - Versión oscura más vibrante
    colorPrimary: '#818cf8',      // Indigo claro
    colorSuccess: '#34d399',      // Verde menta
    colorWarning: '#fbbf24',      // Ámbar brillante
    colorError: '#f87171',        // Rojo coral
    colorInfo: '#22d3ee',         // Cyan brillante
    
    // Tipografía
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontSize: 14,
    fontSizeHeading1: 32,
    fontSizeHeading2: 28,
    fontSizeHeading3: 24,
    fontSizeHeading4: 20,
    fontSizeHeading5: 16,
    
    // Bordes y esquinas
    borderRadius: 12,
    borderRadiusLG: 16,
    borderRadiusSM: 8,
    borderRadiusXS: 6,
    
    // Fondos - Paleta oscura moderna
    colorBgBase: '#0f172a',
    colorBgContainer: '#1e293b',
    colorBgElevated: '#334155',
    colorBgLayout: '#0a0f1e',
    colorBgSpotlight: '#1e293b',
    
    // Bordes
    colorBorder: '#334155',
    colorBorderSecondary: '#1e293b',
    
    // Textos
    colorText: '#f1f5f9',
    colorTextSecondary: '#cbd5e1',
    colorTextTertiary: '#94a3b8',
    colorTextQuaternary: '#64748b',
    
    // Sombras
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)',
    boxShadowSecondary: '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2)',
    
    // Espaciado
    padding: 16,
    paddingLG: 24,
    paddingXL: 32,
    paddingSM: 12,
    paddingXS: 8,
    
    // Animaciones
    motionDurationFast: '0.1s',
    motionDurationMid: '0.2s',
    motionDurationSlow: '0.3s',
  },
  components: {
    Button: {
      borderRadius: 10,
      controlHeight: 44,
      fontWeight: 600,
      primaryShadow: '0 4px 14px rgba(129, 140, 248, 0.3)',
      defaultShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
      dangerShadow: '0 4px 14px rgba(248, 113, 113, 0.3)',
      paddingContentHorizontal: 20,
      defaultBg: '#334155',
      defaultColor: '#f1f5f9',
      defaultBorderColor: '#475569',
    },
    Input: {
      borderRadius: 10,
      controlHeight: 44,
      paddingSM: 12,
      activeBorderColor: '#818cf8',
      hoverBorderColor: '#6366f1',
      activeShadow: '0 0 0 3px rgba(129, 140, 248, 0.15)',
    },
    Select: {
      borderRadius: 10,
      controlHeight: 44,
      optionSelectedBg: 'rgba(129, 140, 248, 0.2)',
      optionActiveBg: 'rgba(129, 140, 248, 0.1)',
    },
    Card: {
      borderRadius: 16,
      paddingLG: 24,
      boxShadowTertiary: '0 8px 16px -4px rgba(0, 0, 0, 0.4), 0 4px 8px -2px rgba(0, 0, 0, 0.3)',
      headerBg: 'transparent',
      headerFontSize: 18,
      headerFontSizeSM: 16,
      headerHeight: 56,
    },
    Table: {
      borderRadius: 12,
      headerBg: '#1e293b',
      headerColor: '#f1f5f9',
      headerSplitColor: '#475569',
      rowHoverBg: '#334155',
      borderColor: '#334155',
      headerBorderRadius: 12,
      cellPaddingBlock: 16,
      cellPaddingInline: 16,
    },
    Modal: {
      borderRadius: 16,
      headerBg: 'transparent',
      contentBg: '#1e293b',
      titleFontSize: 20,
      titleLineHeight: 1.5,
    },
    Badge: {
      colorSuccess: '#34d399',
      colorWarning: '#fbbf24',
      colorError: '#f87171',
      textFontSize: 12,
      textFontWeight: 600,
    },
    Tag: {
      borderRadiusSM: 8,
      fontSizeSM: 13,
      defaultBg: '#334155',
      defaultColor: '#cbd5e1',
    },
    Tabs: {
      itemActiveColor: '#818cf8',
      itemHoverColor: '#a5b4fc',
      itemSelectedColor: '#818cf8',
      inkBarColor: '#818cf8',
      titleFontSize: 15,
    },
    Menu: {
      itemBorderRadius: 10,
      itemMarginBlock: 4,
      itemMarginInline: 8,
      itemPaddingInline: 16,
      itemHeight: 44,
      iconSize: 20,
      subMenuItemBg: 'transparent',
      darkItemBg: 'transparent',
      darkSubMenuItemBg: 'rgba(255, 255, 255, 0.04)',
      darkItemHoverBg: 'rgba(255, 255, 255, 0.08)',
      darkItemSelectedBg: 'rgba(129, 140, 248, 0.2)',
      darkItemSelectedColor: '#fff',
    },
    Layout: {
      bodyBg: '#0a0f1e',
      headerBg: '#0f172a',
      headerHeight: 72,
      headerPadding: '0 32px',
      siderBg: '#0f172a',
      triggerBg: '#1e293b',
      triggerColor: '#ffffff',
    },
    Notification: {
      borderRadius: 12,
      width: 400,
    },
    Message: {
      borderRadius: 10,
      contentPadding: '12px 16px',
    },
    Popover: {
      borderRadius: 12,
    },
    Drawer: {
      borderRadius: 16,
    },
    Form: {
      labelFontSize: 14,
      labelColor: '#cbd5e1',
      labelRequiredMarkColor: '#f87171',
      itemMarginBottom: 20,
    },
    Switch: {
      trackHeight: 24,
      trackMinWidth: 48,
      innerMinMargin: 4,
      innerMaxMargin: 6,
    },
    DatePicker: {
      borderRadius: 10,
      controlHeight: 44,
    },
    Upload: {
      borderRadius: 10,
    },
    Progress: {
      defaultColor: '#818cf8',
      remainingColor: '#334155',
    },
  },
};
