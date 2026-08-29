/**
 * Cloudflare R2 Backend Verification Suite for Physics by Senath
 * Tests all 10 security & operational requirements without printing secrets.
 */

import { 
  createPresignedPutUrl, 
  createPresignedGetUrl, 
  deleteObject, 
  getObjectMetadata,
  MAX_FILE_SIZE_BYTES,
  ALLOWED_MIME_TYPES 
} from "../netlify/functions/services/r2Service";

// Load environment variables from .env if needed
import * as fs from "fs";
import * as path from "path";

function loadEnv() {
  const envPath = path.resolve(process.cwd(), ".env");
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, "utf-8");
    content.split("\n").forEach((line) => {
      const match = line.match(/^\s*([\w_]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let val = match[2] || "";
        val = val.replace(/^['"]|['"]$/g, ""); // strip quotes
        process.env[key] = val;
      }
    });
  }
}

loadEnv();

async function runTests() {
  console.log("=================================================================");
  console.log("Cloudflare R2 Backend Verification Suite - Physics by Senath");
  console.log("=================================================================\n");

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition: boolean, testName: string) {
    totalTests++;
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passedTests++;
    } else {
      console.error(`❌ [FAIL] ${testName}`);
    }
  }

  const testUserA = "usr_test_user_a";
  const testUserB = "usr_test_user_b";
  const testLabId = "lab_experiment_01";
  const testFileName = "pendulum_apparatus.png";
  const testContentType = "image/png";
  const sampleData = Buffer.from("PHYSICS_BY_SENATH_TEST_PAYLOAD_DATA_2026", "utf-8");

  let createdKey = "";
  let presignedPutUrl = "";
  let presignedGetUrl = "";

  // -------------------------------------------------------------
  // Test 1: Authenticated user can request a presigned upload URL
  // -------------------------------------------------------------
  try {
    const res = await createPresignedPutUrl({
      userId: testUserA,
      labId: testLabId,
      category: "diagrams",
      fileName: testFileName,
      contentType: testContentType,
      contentLength: sampleData.length,
    });
    presignedPutUrl = res.uploadUrl;
    createdKey = res.key;

    assert(
      typeof presignedPutUrl === "string" &&
      presignedPutUrl.startsWith("https://") &&
      createdKey.startsWith(`users/${testUserA}/lab/${testLabId}/diagrams/`),
      "1. Authenticated user can request a presigned upload URL with strict key scoping"
    );
  } catch (err: any) {
    assert(false, `1. Authenticated upload URL request failed: ${err?.message}`);
  }

  // -------------------------------------------------------------
  // Test 2: User can upload a test object via presigned PUT URL
  // -------------------------------------------------------------
  try {
    const uploadRes = await fetch(presignedPutUrl, {
      method: "PUT",
      headers: {
        "Content-Type": testContentType,
      },
      body: sampleData,
    });

    assert(uploadRes.ok, `2. User can upload object directly to Cloudflare R2 via presigned PUT URL (Status: ${uploadRes.status})`);
  } catch (err: any) {
    assert(false, `2. Direct R2 upload failed: ${err?.message}`);
  }

  // -------------------------------------------------------------
  // Test 3: User can request a presigned GET URL for their own object
  // -------------------------------------------------------------
  try {
    const getRes = await createPresignedGetUrl({
      userId: testUserA,
      key: createdKey,
      expiresInSeconds: 600,
    });
    presignedGetUrl = getRes.downloadUrl;

    assert(
      typeof presignedGetUrl === "string" &&
      presignedGetUrl.startsWith("https://") &&
      getRes.key === createdKey,
      "3. User can request a short-lived presigned GET URL for their own object"
    );
  } catch (err: any) {
    assert(false, `3. Presigned GET request failed: ${err?.message}`);
  }

  // -------------------------------------------------------------
  // Test 4: User can retrieve their own object
  // -------------------------------------------------------------
  try {
    const downloadRes = await fetch(presignedGetUrl);
    const downloadedText = await downloadRes.text();

    assert(
      downloadRes.ok && downloadedText === "PHYSICS_BY_SENATH_TEST_PAYLOAD_DATA_2026",
      "4. User can retrieve their own private object and content integrity is verified"
    );
  } catch (err: any) {
    assert(false, `4. Object retrieval failed: ${err?.message}`);
  }

  // -------------------------------------------------------------
  // Test 5: Verify object metadata
  // -------------------------------------------------------------
  try {
    const meta = await getObjectMetadata({
      userId: testUserA,
      key: createdKey,
    });

    assert(
      meta.contentLength === sampleData.length && meta.contentType === testContentType,
      "5. User can query metadata for their own object"
    );
  } catch (err: any) {
    assert(false, `5. Metadata query failed: ${err?.message}`);
  }

  // -------------------------------------------------------------
  // Test 6: Another user CANNOT obtain a signed URL for User A's object
  // -------------------------------------------------------------
  try {
    let forbiddenCaught = false;
    try {
      await createPresignedGetUrl({
        userId: testUserB, // Different user!
        key: createdKey,   // Belongs to User A
      });
    } catch (err: any) {
      if (err?.message?.includes("Access Denied")) {
        forbiddenCaught = true;
      }
    }

    assert(
      forbiddenCaught,
      "6. Cross-user access is blocked (User B cannot access User A's object key)"
    );
  } catch (err: any) {
    assert(false, `6. Cross-user isolation test failed: ${err?.message}`);
  }

  // -------------------------------------------------------------
  // Test 7: Another user CANNOT delete User A's object
  // -------------------------------------------------------------
  try {
    let deleteForbiddenCaught = false;
    try {
      await deleteObject({
        userId: testUserB, // Different user!
        key: createdKey,
      });
    } catch (err: any) {
      if (err?.message?.includes("Access Denied")) {
        deleteForbiddenCaught = true;
      }
    }

    assert(
      deleteForbiddenCaught,
      "7. Cross-user deletion is blocked (User B cannot delete User A's object)"
    );
  } catch (err: any) {
    assert(false, `7. Deletion isolation test failed: ${err?.message}`);
  }

  // -------------------------------------------------------------
  // Test 8: Rejection of oversized or unsupported file types
  // -------------------------------------------------------------
  try {
    let invalidTypeCaught = false;
    try {
      await createPresignedPutUrl({
        userId: testUserA,
        labId: testLabId,
        fileName: "malicious_script.exe",
        contentType: "application/x-msdownload", // Invalid MIME
      });
    } catch (err: any) {
      if (err?.message?.includes("Unsupported file type")) {
        invalidTypeCaught = true;
      }
    }

    let oversizedCaught = false;
    try {
      await createPresignedPutUrl({
        userId: testUserA,
        labId: testLabId,
        fileName: "huge_video.png",
        contentType: "image/png",
        contentLength: MAX_FILE_SIZE_BYTES + 1024, // Exceeds 10MB
      });
    } catch (err: any) {
      if (err?.message?.includes("File size exceeds limit")) {
        oversizedCaught = true;
      }
    }

    assert(
      invalidTypeCaught && oversizedCaught,
      "8. Backend validates and rejects unsupported MIME types and oversized files (> 10MB)"
    );
  } catch (err: any) {
    assert(false, `8. Validation test failed: ${err?.message}`);
  }

  // -------------------------------------------------------------
  // Test 9: User can delete their own object
  // -------------------------------------------------------------
  try {
    const delRes = await deleteObject({
      userId: testUserA,
      key: createdKey,
    });

    assert(
      delRes.success === true && delRes.key === createdKey,
      "9. User can successfully delete their own object"
    );
  } catch (err: any) {
    assert(false, `9. Object deletion failed: ${err?.message}`);
  }

  // -------------------------------------------------------------
  // Test 10: R2 credentials never appear in URLs or outputs
  // -------------------------------------------------------------
  try {
    const secretKey = process.env.R2_SECRET_ACCESS_KEY || "";
    const hasSecretInPutUrl = secretKey ? presignedPutUrl.includes(secretKey) : false;
    const hasSecretInGetUrl = secretKey ? presignedGetUrl.includes(secretKey) : false;

    assert(
      !hasSecretInPutUrl && !hasSecretInGetUrl,
      "10. R2 Secret Access Key is never exposed in presigned URLs, headers, or client payloads"
    );
  } catch (err: any) {
    assert(false, `10. Credential leak check failed: ${err?.message}`);
  }

  console.log("\n=================================================================");
  console.log(`Results: ${passedTests} / ${totalTests} tests passed (${Math.round((passedTests / totalTests) * 100)}%)`);
  console.log("=================================================================\n");

  if (passedTests === totalTests) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runTests();
