package com.example.flowsheets.api;

import com.example.flowsheets.service.DataService;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.RequestBody;

/**
 * REST API controller for listing templates and worksheets.
 */
@RestController
@RequestMapping("/api/v1")
public class DataController {
    private final DataService dataService;

    public DataController(DataService dataService) {
        this.dataService = dataService;
    }

    /**
     * List available template names (without extension).
     */
    @GetMapping("/templates")
    public List<String> getTemplates() throws IOException {
        return dataService.listTemplates();
    }

    /**
     * List available worksheet names (without extension).
     */
    @GetMapping("/worksheets")
    public List<String> getWorksheets() throws IOException {
        return dataService.listWorksheets();
    }
    
    @PostMapping("/templates")
    public void createTemplate(@RequestParam String name,
                               @RequestParam(required = false) String source) throws IOException {
        if (source == null) {
            dataService.createTemplate(name);
        } else {
            dataService.createTemplateFromWorksheet(source, name);
        }
    }

    @PostMapping("/templates/{source}/copy")
    public void copyTemplate(@PathVariable String source,
                             @RequestParam String newName) throws IOException {
        dataService.copyTemplate(source, newName);
    }

    @PutMapping("/templates/{oldName}")
    public void renameTemplate(@PathVariable("oldName") String oldName,
                               @RequestParam("newName") String newName) throws IOException {
        dataService.renameTemplate(oldName, newName);
    }

    @DeleteMapping("/templates/{name}")
    public void deleteTemplate(@PathVariable String name) throws IOException {
        dataService.deleteTemplate(name);
    }

    @PostMapping("/worksheets")
    public void createWorksheet(@RequestParam String name,
                                @RequestParam String template) throws IOException {
        dataService.createWorksheet(template, name);
    }

    @PostMapping("/worksheets/{source}/copy")
    public void copyWorksheet(@PathVariable String source,
                              @RequestParam String newName) throws IOException {
        dataService.copyWorksheet(source, newName);
    }

    @PutMapping("/worksheets/{oldName}")
    public void renameWorksheet(@PathVariable("oldName") String oldName,
                                @RequestParam("newName") String newName) throws IOException {
        dataService.renameWorksheet(oldName, newName);
    }

    @DeleteMapping("/worksheets/{name}")
    public void deleteWorksheet(@PathVariable String name) throws IOException {
        dataService.deleteWorksheet(name);
    }

    @ResponseStatus(HttpStatus.BAD_REQUEST)
    @ExceptionHandler(IllegalArgumentException.class)
    public String handleBadRequest(IllegalArgumentException ex) {
        return ex.getMessage();
    }

    /**
     * Get raw JSON for a template.
     */
    @GetMapping(value = "/templates/{name}", produces = MediaType.APPLICATION_JSON_VALUE)
    public String getTemplate(@PathVariable String name) throws IOException {
        return dataService.loadTemplateJson(name);
    }

    /**
     * Overwrite a template JSON file.
     */
    @PutMapping(value = "/templates/{name}", consumes = MediaType.APPLICATION_JSON_VALUE)
    public void saveTemplate(@PathVariable String name, @RequestBody String json) throws IOException {
        dataService.saveTemplateJson(name, json);
    }

    /**
     * Get raw JSON for a worksheet.
     */
    @GetMapping(value = "/worksheets/{name}", produces = MediaType.APPLICATION_JSON_VALUE)
    public String getWorksheet(@PathVariable String name) throws IOException {
        return dataService.loadWorksheetJson(name);
    }

    /**
     * Overwrite a worksheet JSON file.
     */
    @PutMapping(value = "/worksheets/{name}", consumes = MediaType.APPLICATION_JSON_VALUE)
    public void saveWorksheet(@PathVariable String name, @RequestBody String json) throws IOException {
        dataService.saveWorksheetJson(name, json);
    }
}