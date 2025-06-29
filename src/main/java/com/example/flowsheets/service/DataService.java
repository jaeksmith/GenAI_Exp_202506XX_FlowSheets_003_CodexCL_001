package com.example.flowsheets.service;

import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.DirectoryStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;

@Service
public class DataService {
    private final Path templatesDir = Paths.get("data", "templates");
    private final Path worksheetsDir = Paths.get("data", "worksheets");

    public List<String> listTemplates() throws IOException {
        if (!Files.exists(templatesDir)) {
            Files.createDirectories(templatesDir);
        }
        List<String> result = new ArrayList<>();
        try (DirectoryStream<Path> stream = Files.newDirectoryStream(templatesDir, "*.json")) {
            for (Path path : stream) {
                result.add(removeExtension(path.getFileName().toString()));
            }
        }
        return result;
    }

    public List<String> listWorksheets() throws IOException {
        if (!Files.exists(worksheetsDir)) {
            Files.createDirectories(worksheetsDir);
        }
        List<String> result = new ArrayList<>();
        try (DirectoryStream<Path> stream = Files.newDirectoryStream(worksheetsDir, "*.json")) {
            for (Path path : stream) {
                result.add(removeExtension(path.getFileName().toString()));
            }
        }
        return result;
    }

    private String removeExtension(String filename) {
        if (filename.endsWith(".json")) {
            return filename.substring(0, filename.length() - ".json".length());
        }
        return filename;
    }

    private void validateName(String name) {
        if (name == null || name.isEmpty() || name.contains("..")
                || name.contains("/") || name.contains("\\")
                || name.endsWith(".json")) {
            throw new IllegalArgumentException("Invalid name: " + name);
        }
    }

    public void createTemplate(String name) throws IOException {
        validateName(name);
        if (!Files.exists(templatesDir)) {
            Files.createDirectories(templatesDir);
        }
        Path target = templatesDir.resolve(name + ".json");
        if (Files.exists(target)) {
            throw new IllegalArgumentException("Template already exists: " + name);
        }
        Path empty = templatesDir.resolve("empty.json");
        if (Files.exists(empty)) {
            Files.copy(empty, target);
        } else {
            Files.writeString(target, "{}");
        }
    }

    public void createTemplateFromWorksheet(String worksheetName, String name) throws IOException {
        validateName(worksheetName);
        validateName(name);
        if (!Files.exists(templatesDir)) {
            Files.createDirectories(templatesDir);
        }
        Path source = worksheetsDir.resolve(worksheetName + ".json");
        if (!Files.exists(source)) {
            throw new IllegalArgumentException("Worksheet not found: " + worksheetName);
        }
        Path target = templatesDir.resolve(name + ".json");
        if (Files.exists(target)) {
            throw new IllegalArgumentException("Template already exists: " + name);
        }
        Files.copy(source, target);
    }

    public void copyTemplate(String sourceName, String newName) throws IOException {
        validateName(sourceName);
        validateName(newName);
        if (!Files.exists(templatesDir)) {
            Files.createDirectories(templatesDir);
        }
        Path source = templatesDir.resolve(sourceName + ".json");
        if (!Files.exists(source)) {
            throw new IllegalArgumentException("Template not found: " + sourceName);
        }
        Path target = templatesDir.resolve(newName + ".json");
        if (Files.exists(target)) {
            throw new IllegalArgumentException("Template already exists: " + newName);
        }
        Files.copy(source, target);
    }

    public void renameTemplate(String oldName, String newName) throws IOException {
        validateName(oldName);
        validateName(newName);
        if (!Files.exists(templatesDir)) {
            Files.createDirectories(templatesDir);
        }
        Path source = templatesDir.resolve(oldName + ".json");
        if (!Files.exists(source)) {
            throw new IllegalArgumentException("Template not found: " + oldName);
        }
        Path target = templatesDir.resolve(newName + ".json");
        if (Files.exists(target)) {
            throw new IllegalArgumentException("Template already exists: " + newName);
        }
        Files.move(source, target);
    }

    public void deleteTemplate(String name) throws IOException {
        validateName(name);
        if (!Files.exists(templatesDir)) {
            Files.createDirectories(templatesDir);
        }
        Path target = templatesDir.resolve(name + ".json");
        if (!Files.exists(target)) {
            throw new IllegalArgumentException("Template not found: " + name);
        }
        Files.delete(target);
    }

    public void createWorksheet(String templateName, String name) throws IOException {
        validateName(templateName);
        validateName(name);
        if (!Files.exists(worksheetsDir)) {
            Files.createDirectories(worksheetsDir);
        }
        Path source = templatesDir.resolve(templateName + ".json");
        if (!Files.exists(source)) {
            throw new IllegalArgumentException("Template not found: " + templateName);
        }
        Path target = worksheetsDir.resolve(name + ".json");
        if (Files.exists(target)) {
            throw new IllegalArgumentException("Worksheet already exists: " + name);
        }
        Files.copy(source, target);
    }

    public void copyWorksheet(String sourceName, String newName) throws IOException {
        validateName(sourceName);
        validateName(newName);
        if (!Files.exists(worksheetsDir)) {
            Files.createDirectories(worksheetsDir);
        }
        Path source = worksheetsDir.resolve(sourceName + ".json");
        if (!Files.exists(source)) {
            throw new IllegalArgumentException("Worksheet not found: " + sourceName);
        }
        Path target = worksheetsDir.resolve(newName + ".json");
        if (Files.exists(target)) {
            throw new IllegalArgumentException("Worksheet already exists: " + newName);
        }
        Files.copy(source, target);
    }

    public void renameWorksheet(String oldName, String newName) throws IOException {
        validateName(oldName);
        validateName(newName);
        if (!Files.exists(worksheetsDir)) {
            Files.createDirectories(worksheetsDir);
        }
        Path source = worksheetsDir.resolve(oldName + ".json");
        if (!Files.exists(source)) {
            throw new IllegalArgumentException("Worksheet not found: " + oldName);
        }
        Path target = worksheetsDir.resolve(newName + ".json");
        if (Files.exists(target)) {
            throw new IllegalArgumentException("Worksheet already exists: " + newName);
        }
        Files.move(source, target);
    }

    public void deleteWorksheet(String name) throws IOException {
        validateName(name);
        if (!Files.exists(worksheetsDir)) {
            Files.createDirectories(worksheetsDir);
        }
        Path target = worksheetsDir.resolve(name + ".json");
        if (!Files.exists(target)) {
            throw new IllegalArgumentException("Worksheet not found: " + name);
        }
        Files.delete(target);
    }

    /**
     * Load the raw JSON content of a template.
     */
    public String loadTemplateJson(String name) throws IOException {
        validateName(name);
        Path path = templatesDir.resolve(name + ".json");
        if (!Files.exists(path)) {
            throw new IllegalArgumentException("Template not found: " + name);
        }
        return Files.readString(path);
    }

    /**
     * Save raw JSON content into a template file.
     */
    public void saveTemplateJson(String name, String json) throws IOException {
        validateName(name);
        Path path = templatesDir.resolve(name + ".json");
        if (!Files.exists(path)) {
            throw new IllegalArgumentException("Template not found: " + name);
        }
        Files.writeString(path, json);
    }

    /**
     * Load the raw JSON content of a worksheet.
     */
    public String loadWorksheetJson(String name) throws IOException {
        validateName(name);
        Path path = worksheetsDir.resolve(name + ".json");
        if (!Files.exists(path)) {
            throw new IllegalArgumentException("Worksheet not found: " + name);
        }
        return Files.readString(path);
    }

    /**
     * Save raw JSON content into a worksheet file.
     */
    public void saveWorksheetJson(String name, String json) throws IOException {
        validateName(name);
        Path path = worksheetsDir.resolve(name + ".json");
        if (!Files.exists(path)) {
            throw new IllegalArgumentException("Worksheet not found: " + name);
        }
        Files.writeString(path, json);
    }
}