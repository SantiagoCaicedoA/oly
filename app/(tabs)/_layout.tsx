import { TabLoaderProvider, useTabLoader } from "@/components/tab-loader";
import { OlyIcon, OlyIconName } from "@/components/icons/OlyIcon";
import { olyColors, olyPalette } from "@/src/oly-theme/oly-colors";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import type { BottomTabBarButtonProps } from "@react-navigation/bottom-tabs";
import { Tabs } from "expo-router";
import React, { createContext, useEffect, useState } from "react";
import { Pressable, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";

/**
 * Tab bar.
 *
 * Design system: Iconography, and Layout / TabBar.
 *
 * Five tabs, in this order: Home, Rank, Messages, Search, Profile.
 *
 * Rules this file implements:
 *  - No labels. Position and persistence teach the tabs, so every
 *    screen carries an accessibility label instead.
 *  - Outline when inactive, filled when active. Search is the one
 *    exception; a filled magnifier reads as a lollipop, so it keeps
 *    its outline and thickens to 2.2.
 *  - Nothing sits behind an active icon. No disc, no pill, no
 *    background. The Design Bible's `bg-active-highlight` disc put a
 *    primary icon on a primary tint at 1.43:1, which could not be seen.
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

/* Iconography / Sizes. 28 is `icon-tab`, one step above `icon-md`. */
const ICON_SIZE = 28;
/* Layout / TabBar.
   The bar used to float: a rounded, filled, bordered pill inset 14 from
   each side and 28 up from the bottom. That reads as a control sitting ON
   the app, which was fine when every screen was made of cards. The feed is
   full bleed now, so the pill was the only rounded object on screen and it
   left a strip of video showing underneath it.

   Flush to the bottom edge, full width, no fill. The bar is the ground plus
   one hairline, which is the same separator the feed uses between posts.

   68 is the content height, above the safe-area inset react-navigation adds
   underneath. 28 for the glyph and 20 of gutter either side. iOS ships 49,
   which assumes a 24pt glyph and labels; with a 28 glyph and no labels the
   row needs the air or the icons crowd the rule above them. */
const TAB_BAR_HEIGHT = 68;

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
          /* `height` on a tab bar is the TOTAL, and react-navigation adds
             the bottom safe-area inset INSIDE it. Setting height alone to
             68 therefore left a content box of 68 minus the inset, about
             34 on a notched phone, and the glyphs centred in that — high
             up, with the whole home-indicator strip empty beneath them.
             Which is exactly what raising the number from 58 failed to fix.

             Both values are stated here instead. The content box is
             TAB_BAR_HEIGHT whatever the device, and the inset sits below
             it as its own reserved strip. */
          tabBarStyle: isTabBarVisible
            ? {
                height: TAB_BAR_HEIGHT + insets.bottom,
                paddingBottom: insets.bottom,
                backgroundColor: olyColors.bg.page,
                borderTopWidth: StyleSheet.hairlineWidth,
                borderTopColor: olyColors.border.hairline,
                elevation: 0,
                shadowOpacity: 0,
                /* No radius, no side borders, no margins. A bar flush with
                   the screen edge is the edge of the app, and an edge does
                   not need an outline to say so. */
                paddingTop: 0,
                paddingHorizontal: 0,
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

        <Tabs.Screen
          name="profile"
          listeners={loaderListeners}
          options={tab("profile", "Profile")}
        />

        {/* The old centre FAB. Posting lives in the Home header now. */}
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
});
