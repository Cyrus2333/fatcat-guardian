const path = require('node:path');
const { notarize } = require('@electron/notarize');

module.exports = async function notarizeApp(context) {
  if (process.platform !== 'darwin') {
    return;
  }

  const { electronPlatformName, appOutDir, packager } = context;
  if (electronPlatformName !== 'darwin') {
    return;
  }

  const appName = packager.appInfo.productFilename;
  const appPath = path.join(appOutDir, `${appName}.app`);

  const teamId = process.env.APPLE_TEAM_ID;
  const appleId = process.env.APPLE_ID;
  const appleIdPassword = process.env.APPLE_APP_SPECIFIC_PASSWORD;
  const apiKey = process.env.APPLE_API_KEY;
  const apiKeyId = process.env.APPLE_API_KEY_ID;
  const apiIssuer = process.env.APPLE_API_ISSUER;

  const hasAppleIdFlow = Boolean(teamId && appleId && appleIdPassword);
  const hasApiKeyFlow = Boolean(teamId && apiKey && apiKeyId && apiIssuer);

  if (!hasAppleIdFlow && !hasApiKeyFlow) {
    console.log('[notarize] skipped: missing Apple notarization credentials');
    return;
  }

  if (hasApiKeyFlow) {
    await notarize({
      tool: 'notarytool',
      appPath,
      teamId,
      appleApiKey: apiKey,
      appleApiKeyId: apiKeyId,
      appleApiIssuer: apiIssuer,
    });
    return;
  }

  await notarize({
    tool: 'notarytool',
    appPath,
    teamId,
    appleId,
    appleIdPassword,
  });
};
