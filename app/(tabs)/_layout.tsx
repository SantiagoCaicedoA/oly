import { TabLoaderProvider, useTabLoader } from "@/components/tab-loader";
import { OlyIcon, OlyIconName } from "@/components/icons/OlyIcon";
import { olyColors, olyPalette } from "@/src/oly-theme/oly-colors";
import { olyGlow, olyShadow } from "@/src/oly-theme/oly-elevation";
import { olyRadius } from "@/src/oly-theme/oly-radius";
import { olySpacing } from "@/src/oly-theme/oly-spacing";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import type { BottomTabBarButtonProps } from "@react-navigation/bottom-tabs";
import { Tabs } from "expo-router";
import React, { createContext, useEffect, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Glass } from "@/src/oly-components/shop/ShopKit";

/**
 * Tab bar.
 *
 * Design system: Iconography, and Layout / TabBar.
 *
 * Five tabs, in this order: Home, Rank, Messages, Search, Shop.
 *
 * Rules this file implements:
 *  - No labels. Position and persistence teach the tabs, so every
 *    screen carries an accessibility label instead.
 *  - Outline when inactive, filled when active. Search is the one
 *    exception; a filled magnifier reads as a lollipop, so it keeps
 *    its outline and thickens to 2.2.
 *  - Nothing sits behind an active icon. A glowing blue dot under it
 *    marks the tab instead.
 *  - No centre FAB. Posting a lift moved to the header on Home, beside
 *    notifications. A floating button over the feed covered content and
 *    made the bar asymmetric for one action.
 *
 * Messages and Search are placeholder screens. Neither feature has an
 * endpoint yet. See the note at the top of each file.
 */

export const TabBarContext = createContext({
  hideTabBar: () => {},
  showTabBar: () => {},
});

/* Iconography / Sizes. 26 sits inside the 64 tall glass pill. */
const ICON_SIZE = 26;
export default function TabLayout() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <TabLoaderProvider>
        <TabsWithLoader />
      </TabLoaderProvider>
    </GestureHandlerRootView>
  );
}

function TabsWithLoader() {
  const [isTabBarVisible] = useState(true);
  const insets = useSafeAreaInsets();
  const { show } = useTabLoader();

  // branded loader on the first open of the tabs
  useEffect(() => {
    show();
  }, [show]);

  // shown before opening a tab that fetches
  const loaderListeners = { tabPress: () => show() };

  /**
   * The button is drawn here rather than through `tabBarIcon`.
   *
   * `BottomTabItem` puts `tabBarItemStyle` on an outer wrapper, then
   * renders an inner pressable whose style is hardcoded to
   * `justifyContent: "flex-start"` with `padding: 5`. No prop reaches
   * it. The icon therefore pins to the top of the item and the leftover
   * height falls below it, which reads as the old label slot still
   * being there. Replacing the button is the only way to centre it.
   */
  const tab = (name: OlyIconName, label: string) => ({
    title: label,
    tabBarButton: (props: BottomTabBarButtonProps) => {
      const focused = !!props["aria-selected"];
      return (
        <Pressable
          onPress={props.onPress}
          onLongPress={props.onLongPress}
          android_ripple={{ borderless: true }}
          accessibilityRole="button"
          accessibilityState={{ selected: focused }}
          accessibilityLabel={label}
          style={styles.tabButton}
        >
          <OlyIcon
            name={name}
            size={ICON_SIZE}
            filled={focused}
            color={focused ? olyColors.text.primary : olyColors.text.secondary}
          />
          {/* Glowing blue dot under the active tab, as on the canvas. */}
          <View style={[styles.activeDot, !focused && styles.activeDotOff]} />
        </Pressable>
      );
    },
  });

  return (
    <BottomSheetModalProvider>
      <Tabs
        screenOptions={{
          headerShown: false,
          sceneStyle: { backgroundColor: olyPalette.background },
          /* Floating glass pill (Feed A and the Shop on the canvas).
             Screens scroll under it; give lists ~120 of bottom padding. */
          tabBarStyle: isTabBarVisible
            ? {
                position: "absolute",
                marginHorizontal: olySpacing[16],
                bottom: Math.max(insets.bottom - 10, 12),
                height: 64,
                paddingBottom: 0,
                paddingTop: 0,
                paddingHorizontal: 4,
                borderRadius: olyRadius.full,
                backgroundColor: "transparent",
                borderTopWidth: 0,
                elevation: 0,
                ...olyShadow.float,
              }
            : { display: "none" },
          /* The outer wrapper only. The glyph is centred by the button
             this file renders, not by these.

             No height here. The bar is 60 including its 1px borders, so
             its content box is 58. A child pinned to 60 overflows by 2
             and lands off centre, which reads as the glyph sitting low.
             Stretching to the content box is what centres it. */
          tabBarItemStyle: {
            flex: 1,
            margin: 0,
            padding: 0,
          },
          tabBarShowLabel: false,
          tabBarBackground: () => (
            <Glass radius={olyRadius.full} style={StyleSheet.absoluteFill} />
          ),
          animation: "none",
        }}
      >
        <Tabs.Screen
          name="home"
          listeners={loaderListeners}
          options={tab("home", "Home")}
        />

        <Tabs.Screen
          name="rank"
          listeners={loaderListeners}
          options={tab("rank", "Rank")}
        />

        <Tabs.Screen name="messages" options={tab("messages", "Messages")} />

        <Tabs.Screen name="search" options={tab("search", "Search")} />

        <Tabs.Screen name="marketplace" options={tab("shop", "Marketplace")} />

        {/* Profile moved to the avatar in the Home header. Still a tab route,
            just not in the bar. */}
        <Tabs.Screen name="profile" listeners={loaderListeners} options={{ href: null }} />

        {/* Training is hidden for the MVP and returns in v2. Route stays, tab is hidden. */}
        <Tabs.Screen name="workout" options={{ href: null }} />

        {/* Upload route stays, tab is hidden. Posting lives in the Home header. */}
        <Tabs.Screen name="upload" options={{ href: null }} />

      </Tabs>
    </BottomSheetModalProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  /* Fills the item and centres the glyph on both axes. No padding,
     so the icon sits on the bar's true vertical centre. */
  tabButton: {
    flex: 1,
    alignSelf: "stretch",
    alignItems: "center",
    justifyContent: "center",
  },
  activeDot: {
    position: "absolute",
    bottom: 9,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: olyPalette.primary,
    ...olyGlow.sm,
  },
  activeDotOff: { opacity: 0 },
});
