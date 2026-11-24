using System;
using System.IO;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;
using UnityEngine.SceneManagement;
using UnityEngine.UI;

public static class ArmyRushSetup
{
    private const string Root = "Assets/ARMY_RUSH";
    private const string ScenePath = Root + "/Scenes/ArmyRush.unity";

    [MenuItem("ARMY RUSH/Setup Game")]
    public static void SetupGame()
    {
        EnsureFolders();

        if (File.Exists(ScenePath) &&
            !EditorUtility.DisplayDialog(
                "Replace Army Rush scene?",
                "The setup scene already exists. Replace it with a fresh starter scene?",
                "Replace",
                "Cancel"))
        {
            return;
        }

        Material trackMaterial = CreateMaterial(
            Root + "/Art/Materials/Track.mat",
            new Color(0.16f, 0.22f, 0.25f));
        Material railMaterial = CreateMaterial(
            Root + "/Art/Materials/Rails.mat",
            new Color(0.34f, 0.42f, 0.44f));
        Material soldierMaterial = CreateMaterial(
            Root + "/Art/Materials/SoldierBlue.mat",
            new Color(0.12f, 0.38f, 0.95f));
        CreateSoldierPrefab(soldierMaterial);

        Scene scene = EditorSceneManager.NewScene(
            NewSceneSetup.EmptyScene,
            NewSceneMode.Single);
        CreateTrack(trackMaterial, railMaterial);
        CreateCamera();
        CreateLighting();
        CreateStarterSoldier();
        CreateCanvas();
        new GameObject("ArmyRushGameManager");

        EditorSceneManager.MarkSceneDirty(scene);
        EditorSceneManager.SaveScene(scene, ScenePath);
        AddSceneToBuildSettings(ScenePath);
        AssetDatabase.SaveAssets();
        AssetDatabase.Refresh();

        EditorUtility.DisplayDialog(
            "Army Rush setup complete",
            "Created the starter scene, materials, Soldier prefab, and project folders.",
            "OK");
    }

    private static void EnsureFolders()
    {
        string[] folders =
        {
            "Art/Characters",
            "Art/Environments",
            "Art/Materials",
            "Art/Textures",
            "Audio/Music",
            "Audio/SFX",
            "Animations",
            "Prefabs/Soldiers",
            "Prefabs/Enemies",
            "Prefabs/Gates",
            "Prefabs/Obstacles",
            "Prefabs/Bosses",
            "Prefabs/UI",
            "Scenes",
            "Scripts/Core",
            "Scripts/Player",
            "Scripts/Army",
            "Scripts/Gates",
            "Scripts/Obstacles",
            "Scripts/Enemies",
            "Scripts/Combat",
            "Scripts/Boss",
            "Scripts/Levels",
            "Scripts/Camera",
            "Scripts/UI",
            "Scripts/Economy",
            "Scripts/Save",
            "Scripts/Audio",
            "ScriptableObjects/Levels",
            "ScriptableObjects/Upgrades",
            "ScriptableObjects/GameConfig",
            "Editor"
        };

        foreach (string folder in folders)
        {
            Directory.CreateDirectory(Path.Combine(Root, folder));
        }
    }

    private static Material CreateMaterial(string path, Color color)
    {
        Material material = AssetDatabase.LoadAssetAtPath<Material>(path);
        if (material != null)
        {
            return material;
        }

        Shader shader = Shader.Find("Universal Render Pipeline/Lit");
        if (shader == null)
        {
            shader = Shader.Find("Standard");
        }

        if (shader == null)
        {
            throw new InvalidOperationException("No compatible Unity material shader was found.");
        }

        material = new Material(shader) { color = color };
        AssetDatabase.CreateAsset(material, path);
        return material;
    }

    private static void CreateSoldierPrefab(Material soldierMaterial)
    {
        const string prefabPath = Root + "/Prefabs/Soldiers/Soldier.prefab";
        if (AssetDatabase.LoadAssetAtPath<GameObject>(prefabPath) != null)
        {
            return;
        }

        GameObject soldier = GameObject.CreatePrimitive(PrimitiveType.Capsule);
        soldier.name = "Soldier";
        soldier.transform.localScale = new Vector3(0.6f, 0.75f, 0.6f);
        soldier.GetComponent<Renderer>().sharedMaterial = soldierMaterial;

        GameObject head = GameObject.CreatePrimitive(PrimitiveType.Sphere);
        head.name = "Head";
        head.transform.SetParent(soldier.transform, false);
        head.transform.localPosition = new Vector3(0f, 0.85f, 0f);
        head.transform.localScale = new Vector3(0.55f, 0.55f, 0.55f);
        head.GetComponent<Renderer>().sharedMaterial = soldierMaterial;

        foreach (Collider collider in soldier.GetComponentsInChildren<Collider>())
        {
            UnityEngine.Object.DestroyImmediate(collider);
        }

        PrefabUtility.SaveAsPrefabAsset(soldier, prefabPath);
        UnityEngine.Object.DestroyImmediate(soldier);
    }

    private static void CreateTrack(Material trackMaterial, Material railMaterial)
    {
        CreateCube(
            "Track",
            new Vector3(0f, -0.35f, 27.5f),
            new Vector3(10f, 0.5f, 65f),
            trackMaterial);
        CreateCube(
            "Left Track Rail",
            new Vector3(-5.15f, 0.15f, 27.5f),
            new Vector3(0.3f, 0.8f, 65f),
            railMaterial);
        CreateCube(
            "Right Track Rail",
            new Vector3(5.15f, 0.15f, 27.5f),
            new Vector3(0.3f, 0.8f, 65f),
            railMaterial);
    }

    private static void CreateCube(
        string name,
        Vector3 position,
        Vector3 scale,
        Material material)
    {
        GameObject cube = GameObject.CreatePrimitive(PrimitiveType.Cube);
        cube.name = name;
        cube.transform.position = position;
        cube.transform.localScale = scale;
        cube.GetComponent<Renderer>().sharedMaterial = material;
    }

    private static void CreateCamera()
    {
        GameObject cameraObject = new GameObject("Main Camera", typeof(Camera), typeof(AudioListener));
        cameraObject.tag = "MainCamera";
        cameraObject.transform.position = new Vector3(0f, 8f, -12f);
        cameraObject.transform.rotation = Quaternion.Euler(28f, 0f, 0f);

        Camera camera = cameraObject.GetComponent<Camera>();
        camera.fieldOfView = 55f;
        camera.nearClipPlane = 0.1f;
        camera.farClipPlane = 150f;
        camera.backgroundColor = new Color(0.55f, 0.72f, 0.82f);
        camera.clearFlags = CameraClearFlags.SolidColor;
    }

    private static void CreateLighting()
    {
        GameObject lightObject = new GameObject("Directional Light", typeof(Light));
        lightObject.transform.rotation = Quaternion.Euler(48f, -32f, 0f);
        Light light = lightObject.GetComponent<Light>();
        light.type = LightType.Directional;
        light.intensity = 1.15f;
    }

    private static void CreateStarterSoldier()
    {
        const string prefabPath = Root + "/Prefabs/Soldiers/Soldier.prefab";
        GameObject soldierPrefab = AssetDatabase.LoadAssetAtPath<GameObject>(prefabPath);
        if (soldierPrefab == null)
        {
            throw new InvalidOperationException("The Soldier prefab could not be loaded.");
        }

        GameObject soldier = (GameObject)PrefabUtility.InstantiatePrefab(soldierPrefab);
        soldier.transform.position = new Vector3(0f, 0.4f, 2f);
        soldier.name = "Starter Soldier";
    }

    private static void CreateCanvas()
    {
        GameObject canvasObject = new GameObject(
            "Army Rush UI",
            typeof(Canvas),
            typeof(CanvasScaler),
            typeof(GraphicRaycaster));
        Canvas canvas = canvasObject.GetComponent<Canvas>();
        canvas.renderMode = RenderMode.ScreenSpaceOverlay;

        CanvasScaler scaler = canvasObject.GetComponent<CanvasScaler>();
        scaler.uiScaleMode = CanvasScaler.ScaleMode.ScaleWithScreenSize;
        scaler.referenceResolution = new Vector2(1080f, 1920f);
        scaler.matchWidthOrHeight = 0.5f;

        Font font = Resources.GetBuiltinResource<Font>("LegacyRuntime.ttf");
        CreateText(
            canvasObject.transform,
            "Title",
            "ARMY RUSH",
            font,
            72,
            new Vector2(0f, -130f),
            new Vector2(900f, 120f));
        CreateText(
            canvasObject.transform,
            "Setup Status",
            "Starter scene ready",
            font,
            36,
            new Vector2(0f, -230f),
            new Vector2(900f, 80f));
    }

    private static void CreateText(
        Transform parent,
        string name,
        string value,
        Font font,
        int fontSize,
        Vector2 anchoredPosition,
        Vector2 size)
    {
        GameObject textObject = new GameObject(
            name,
            typeof(RectTransform),
            typeof(CanvasRenderer),
            typeof(Text));
        textObject.transform.SetParent(parent, false);

        RectTransform rect = textObject.GetComponent<RectTransform>();
        rect.anchorMin = new Vector2(0.5f, 1f);
        rect.anchorMax = new Vector2(0.5f, 1f);
        rect.pivot = new Vector2(0.5f, 1f);
        rect.anchoredPosition = anchoredPosition;
        rect.sizeDelta = size;

        Text text = textObject.GetComponent<Text>();
        text.text = value;
        text.font = font;
        text.fontSize = fontSize;
        text.fontStyle = FontStyle.Bold;
        text.alignment = TextAnchor.MiddleCenter;
        text.color = Color.white;
    }

    private static void AddSceneToBuildSettings(string scenePath)
    {
        EditorBuildSettingsScene[] existingScenes = EditorBuildSettings.scenes;
        foreach (EditorBuildSettingsScene existingScene in existingScenes)
        {
            if (existingScene.path == scenePath)
            {
                existingScene.enabled = true;
                EditorBuildSettings.scenes = existingScenes;
                return;
            }
        }

        Array.Resize(ref existingScenes, existingScenes.Length + 1);
        existingScenes[existingScenes.Length - 1] =
            new EditorBuildSettingsScene(scenePath, true);
        EditorBuildSettings.scenes = existingScenes;
    }
}
